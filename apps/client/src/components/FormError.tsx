export async function parseApiError(error: unknown, fallback = 'Something went wrong'): Promise<Error> {
  if (error instanceof Error) {
    const anyErr = error as any;

    if (anyErr.body?.message) {
      return new Error(anyErr.body.message);
    }
    if (anyErr.body?.error) {
      return new Error(anyErr.body.error);
    }

    return error;
  }
  return new Error(fallback);
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: 'No account found with this username or email',
  INCORRECT_PASSWORD: 'Incorrect password',
  BAD_CREDENTIAL: 'Invalid credentials',
  EMAIL_ALREADY_IN_USE: 'This email is already registered',
  USERNAME_UNAVAILABLE: 'This username is already taken',
  PASSWORD_IS_TOO_SHORT: 'Password must contain at list 12 characters',
  PASSWORD_MUST_CONTAIN_UPPERCASE_LOWERCASE_NUMBER_AND_SYMBOL:
    'Password must include at least one uppercase letter, one lowercase letter, a number, and a special character',
};

export function formatAuthError(rawMessage: string | undefined | null): string {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return 'Something went wrong';
  }

  if (AUTH_ERROR_MESSAGES[rawMessage]) {
    return AUTH_ERROR_MESSAGES[rawMessage];
  }

  if (rawMessage.includes('must match format "email"')) {
    return 'Please enter a valid email address';
  }
  if (rawMessage.includes('must NOT have more than 30 characters')) {
    return 'Username must be 30 characters or fewer';
  }
  if (rawMessage.includes('must NOT have fewer than')) {
    return 'Password is too short';
  }
  if (rawMessage.includes('must NOT have more than')) {
    return 'Password is too long';
  }
  if (rawMessage.toLowerCase().includes('required')) {
    return 'This field is required';
  }

  if (rawMessage.length > 120) {
    return 'Invalid input data';
  }

  return rawMessage;
}

export function FormError({ message }: { message: Error | null }) {
  if (!message) return null;

  return <p className="text-sm text-red-400 text-center min-h-[1.25rem]">{formatAuthError(message.message)}</p>;
}
