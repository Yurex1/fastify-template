import { Exception } from './types';

export class ApiError extends Error {
  public statusCode: number;

  constructor(code: number, message: string) {
    super(message);
    this.statusCode = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const exception: Exception = {
  isCustomException(error: unknown): boolean {
    return error instanceof ApiError;
  },

  badRequest(message = 'Bad Request'): ApiError {
    return new ApiError(400, message);
  },

  unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  },

  forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  },

  notFound(message = 'Not Found'): ApiError {
    return new ApiError(404, message);
  },

  serverError(message = 'Internal server error'): ApiError {
    return new ApiError(500, message);
  },
};
