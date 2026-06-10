export interface ApiError extends Error {
  statusCode: number;
}

export function createApiError(code: number, message: string): ApiError {
  const error = new Error(message) as ApiError;
  error.name = 'ApiError';
  error.statusCode = code;
  return error;
}
