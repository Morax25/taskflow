import { HttpCode, type HttpCodeValue } from './statusCode.js';

export type DomainErrorCode =
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'INVALID_STATE'
  | 'OPERATION_NOT_ALLOWED'
  | 'VALIDATION_FAILED'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'BAD_REQUEST';

const domainToHttpMap: Record<DomainErrorCode, HttpCodeValue> = {
  NOT_FOUND: HttpCode.NOT_FOUND,
  ALREADY_EXISTS: HttpCode.CONFLICT,
  INVALID_STATE: HttpCode.BAD_REQUEST,
  OPERATION_NOT_ALLOWED: HttpCode.FORBIDDEN,
  VALIDATION_FAILED: HttpCode.UNPROCESSABLE,
  CONFLICT: HttpCode.CONFLICT,
  UNAUTHORIZED: HttpCode.UNAUTHORIZED,
  BAD_REQUEST: HttpCode.BAD_REQUEST,
};

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly httpCode: HttpCodeValue;
  readonly isOperational = true;
  readonly details?: unknown;
  readonly timestamp: string;

  constructor(code: DomainErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.httpCode = domainToHttpMap[code];
    this.details = details;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
