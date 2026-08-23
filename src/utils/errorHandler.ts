import { logger } from './../config/logger.js';

import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
import ApiError from './ApiError.js';
import { DomainError } from './domainError.js';
import { Prisma } from '../generated/prisma/client.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function normalise(err: unknown): {
  status: number;
  message: string;
  code?: string;
  errors?: unknown;
  isOperational: boolean;
} {
  if (err instanceof ApiError) {
    return {
      status: err.statusCode,
      message: err.message,
      errors: err.errors.length ? err.errors : undefined,
      isOperational: err.isOperational,
    };
  }

  if (err instanceof DomainError) {
    return {
      status: err.httpCode,
      message: err.message,
      errors: err.details,
      isOperational: true,
    };
  }

  // Zod validation errors — thrown directly by your route/service layer when
  // request bodies fail schema parsing (assignment requires Zod validation).
  if (err && typeof err === 'object' && 'issues' in err && Array.isArray((err as any).issues)) {
    const zodErr = err as { issues: Array<{ path: (string | number)[]; message: string }> };
    return {
      status: 400,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: zodErr.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
      isOperational: true,
    };
  }

  // Prisma: known request errors carry a stable `code` (P20xx) we can branch on.
  // https://www.prisma.io/docs/orm/reference/error-reference
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation — err.meta.target lists the column(s).
        const target = (err.meta?.target as string[] | undefined)?.join(', ');
        return {
          status: 409,
          message: `A record with this ${target ?? 'value'} already exists`,
          code: 'DUPLICATE_RECORD',
          errors: err.meta,
          isOperational: true,
        };
      }
      case 'P2025':
        // Record required for the operation (update/delete) wasn't found.
        return {
          status: 404,
          message: 'Record not found',
          code: 'NOT_FOUND',
          isOperational: true,
        };
      case 'P2003':
        // Foreign key constraint failed — e.g. assigning to a task_id/user_id
        // that doesn't exist, or that belongs to a different org.
        return {
          status: 400,
          message: 'Invalid reference — related record does not exist',
          code: 'FOREIGN_KEY_VIOLATION',
          errors: err.meta,
          isOperational: true,
        };
      default:
        return {
          status: 400,
          message: 'Database request error',
          code: err.code,
          isOperational: true,
        };
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return {
      status: 500,
      message: 'Internal data query error',
      isOperational: false,
    };
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      message: 'Database unavailable',
      isOperational: false,
    };
  }

  return {
    status: 500,
    message: IS_PRODUCTION
      ? 'Internal Server Error'
      : err instanceof Error
        ? err.message
        : String(err),
    isOperational: false,
  };
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { status, message, code, errors, isOperational } = normalise(err);

  const logPayload = {
    status,
    message,
    path: req.originalUrl,
    method: req.method,
    requestId: req.headers['x-request-id'],
    error: err instanceof Error ? err.message : err,
    stack: err instanceof Error ? err.stack : undefined,
  };

  if (status >= 500) {
    logger.error(logPayload);
  } else {
    logger.warn(logPayload);
  }

  if (res.headersSent) return;

  res.status(status).json({
    error: message,
    code: code ?? (isOperational ? 'OPERATIONAL_ERROR' : 'INTERNAL_ERROR'),
    details: errors ?? {},
    ...(!IS_PRODUCTION && !isOperational && { stack: logPayload.stack }),
  });
};

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({
    message: 'Unhandled promise rejection',
    error: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  setTimeout(() => process.exit(1), 1000);
});

process.on('uncaughtException', (err: Error) => {
  logger.error({
    message: 'Uncaught exception',
    error: err.message,
    stack: err.stack,
  });

  setTimeout(() => process.exit(1), 1000);
});