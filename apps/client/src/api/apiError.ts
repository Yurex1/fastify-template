export interface ApiError extends Error {
  statusCode: number;
}

export function createApiError(code: number, message: string): ApiError {
  const error = new Error(message) as ApiError;
  error.name = 'ApiError';
  error.statusCode = code;
  return error;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === 'ApiError' && 'statusCode' in error;
}
