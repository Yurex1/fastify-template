import { HTTPError } from 'ky';

export const getErrorMessage = async (error: unknown): Promise<string> => {
  if (error instanceof HTTPError) {
    try {
      const body = await error.response.json<{ message?: string; error?: string }>();
      return body.message ?? body.error ?? 'Something went wrong';
    } catch {
      return 'Something went wrong';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};
