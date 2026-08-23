class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: unknown[];
  readonly success = false;
  readonly isOperational: boolean;

  constructor({
    statusCode,
    message = 'Something went wrong',
    errors = [],
    isOperational = true,
  }: {
    statusCode: number;
    message?: string;
    errors?: unknown[];
    isOperational?: boolean;
  }) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
