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
  isCustomException(error: unknown) {
    return error instanceof ApiError;
  },

  badRequest(message = 'Bad Request') {
    return new ApiError(400, message);
  },

  unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  },

  forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  },

  notFound(message = 'Not Found') {
    return new ApiError(404, message);
  },

  serverError(message = 'Internal server error') {
    return new ApiError(500, message);
  },
};
