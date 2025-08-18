export interface Exception {
  isCustomException(error: unknown): boolean;
  badRequest(message?: string): void;
  unauthorized(message?: string): void;
  forbidden(message?: string): void;
  notFound(message?: string): void;
  serverError(message?: string): void;
}
