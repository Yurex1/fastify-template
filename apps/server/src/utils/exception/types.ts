import { ApiError } from './util';

export interface Exception {
  isCustomException(error: unknown): boolean;
  badRequest(message?: string): ApiError;
  unauthorized(message?: string): ApiError;
  forbidden(message?: string): ApiError;
  notFound(message?: string): ApiError;
  serverError(message?: string): ApiError;
}
