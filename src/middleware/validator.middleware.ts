import { z } from 'zod';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const validate = (schema: z.ZodTypeAny) =>
  asyncHandler(async (req, _res, next) => {
    console.log('This is body', req.body);
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};

      for (const issue of result.error.issues) {
        const field = issue.path.length ? issue.path.join('.') : 'body';

        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(issue.message);
      }

      const errors = Object.entries(fieldErrors).map(([field, messages]) => ({
        field,
        errors: messages,
      }));

      throw new ApiError({
        statusCode: 400,
        message: 'Invalid data',
        errors,
      });
    }
    next();
  });
