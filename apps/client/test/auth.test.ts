// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import auth from '../src/api/auth/auth';
import { useAuthStore } from '../src/stores/auth';
import type { ApiError } from '../src/api/apiError';
import type { ChangePassword, SignIn, SignUp } from '../src/api/auth/types';
import type { Session } from '../src/api/user/types';

const mockSignUpData: SignUp = {
  email: 'alice@example.com',
  username: 'Alice',
  password: 'securePassword123',
};

const mockSignInData: SignIn = {
  usernameOrEmail: 'alice@example.com',
  password: 'securePassword123',
};

const mockSession: Session = {
  accessToken: 'fake-access-token',
  expiresAt: '2026-06-17T15:00:00.000Z',
  user: {
    id: 1,
    email: 'alice@example.com',
    username: 'Alice',
    createdAt: '2026-06-17T14:00:00.000Z',
    updatedAt: '2026-06-17T14:00:00.000Z',
    lastseen: '2026-06-17T14:30:00.000Z',
  },
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const mockFetchOnce = (body: unknown, status = 200) =>
  vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(body, status));

const captureNextRequest = (body: unknown, status = 200) => {
  const captured: { body?: unknown } = {};
  vi.mocked(fetch).mockImplementationOnce(async (input) => {
    captured.body = await (input as Request).clone().json();
    return jsonResponse(body, status);
  });
  return captured;
};

const requestAt = (index: number): Request => vi.mocked(fetch).mock.calls[index][0] as Request;
const lastRequest = (): Request => {
  const { calls } = vi.mocked(fetch).mock;
  return calls[calls.length - 1][0] as Request;
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  useAuthStore.setState({ accessToken: null, currentUser: null, isAuthenticated: false });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('auth api: endpoints, payloads and responses', () => {
  it('signUp posts the credentials to /auth/sign-up and returns the session', async () => {
    const captured = captureNextRequest(mockSession);

    const result = await auth.signUp(mockSignUpData);

    const request = lastRequest();
    expect(request.method).toBe('POST');
    expect(request.url).toContain('/auth/sign-up');
    expect(captured.body).toEqual(mockSignUpData);
    expect(result).toEqual(mockSession);
  });

  it('signIn posts to /auth/sign-in and returns the session', async () => {
    const captured = captureNextRequest(mockSession);

    const result = await auth.signIn(mockSignInData);

    const request = lastRequest();
    expect(request.method).toBe('POST');
    expect(request.url).toContain('/auth/sign-in');
    expect(captured.body).toEqual(mockSignInData);
    expect(result).toEqual(mockSession);
  });

  it('signInWithGoogle posts the credential to auth/google', async () => {
    const captured = captureNextRequest(mockSession);

    const result = await auth.signInWithGoogle('google-credential');

    const request = lastRequest();
    expect(request.method).toBe('POST');
    expect(request.url).toContain('auth/google');
    expect(captured.body).toEqual({ credential: 'google-credential' });
    expect(result).toEqual(mockSession);
  });

  it('changePassword sends a PUT to /auth/change-password', async () => {
    const payload: ChangePassword = { oldPassword: 'old-pass-123', newPassword: 'new-pass-456' };
    const captured = captureNextRequest({ ok: true });

    await auth.changePassword(payload);

    const request = lastRequest();
    expect(request.method).toBe('PUT');
    expect(request.url).toContain('/auth/change-password');
    expect(captured.body).toEqual(payload);
  });

  it('signOut posts to /auth/sign-out', async () => {
    mockFetchOnce({ signedOut: true });

    const result = await auth.signOut();

    const request = lastRequest();
    expect(request.method).toBe('POST');
    expect(request.url).toContain('/auth/sign-out');
    expect(result).toEqual({ signedOut: true });
  });

  it('refresh posts to /auth/refresh and returns the session', async () => {
    mockFetchOnce(mockSession);

    const result = await auth.refresh();

    const request = lastRequest();
    expect(request.method).toBe('POST');
    expect(request.url).toContain('/auth/refresh');
    expect(result).toEqual(mockSession);
  });
});

describe('auth api: request headers', () => {
  it('attaches the Bearer token from the auth store when authenticated', async () => {
    useAuthStore.getState().setAccessToken('stored-access-token');
    mockFetchOnce(mockSession);

    await auth.signIn(mockSignInData);

    expect(lastRequest().headers.get('authorization')).toBe('Bearer stored-access-token');
  });

  it('omits the Authorization header when there is no token', async () => {
    mockFetchOnce(mockSession);

    await auth.signIn(mockSignInData);

    expect(lastRequest().headers.get('authorization')).toBeNull();
  });

  it('always sends the x-device-id header', async () => {
    mockFetchOnce(mockSession);

    await auth.signIn(mockSignInData);

    expect(lastRequest().headers.get('x-device-id')).toBeTruthy();
  });
});

describe('auth api: error handling', () => {
  it('throws an ApiError carrying the status code for 4xx responses', async () => {
    mockFetchOnce({ message: 'INCORRECT_PASSWORD' }, 400);

    const error = (await auth.signIn(mockSignInData).catch((e) => e)) as ApiError;

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('INCORRECT_PASSWORD');
  });
});

describe('auth api: 401 refresh flow', () => {
  it('refreshes the token on a 401 and retries the original request', async () => {
    const refreshedSession = { ...mockSession, accessToken: 'refreshed-access-token' };

    mockFetchOnce({ message: 'UNAUTHORIZED' }, 401);
    mockFetchOnce(refreshedSession);
    mockFetchOnce(mockSession);

    const result = await auth.signIn(mockSignInData);

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);
    expect(requestAt(1).url).toContain('auth/refresh');
    expect(requestAt(2).headers.get('authorization')).toBe('Bearer refreshed-access-token');
    expect(useAuthStore.getState().accessToken).toBe('refreshed-access-token');
    expect(result).toEqual(mockSession);
  });

  it('clears the token and rejects with "Session expired" when refresh fails', async () => {
    mockFetchOnce({ message: 'UNAUTHORIZED' }, 401);
    mockFetchOnce({ message: 'REFRESH_TOKEN_EXPIRED' }, 401);

    await expect(auth.signIn(mockSignInData)).rejects.toThrow('Session expired');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
