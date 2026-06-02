import ky from 'ky';
import { ERROR_STATUSES } from '../utils/consts/errorStatus';
import { useAuthStore } from '../stores/auth';
import type { User } from './user/types';

const userAgent = navigator.userAgent;
let refreshPromise: Promise<{ accessToken: string; user: User; expiresAt: string }> | null = null;

const api = ky.create({
  prefix: import.meta.env.VITE_API_URL,
  credentials: 'include',
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
        request.headers.set('x-device-id', userAgent);
      },
    ],
    afterResponse: [
      async ({ request, response }) => {
        if (response.status === ERROR_STATUSES.UNAUTHORIZED && !request.url.includes('auth/refresh')) {
          try {
            if (!refreshPromise) {
              refreshPromise = api
                .post('auth/refresh')
                .json<{ accessToken: string; user: User; expiresAt: string }>()
                .finally(() => {
                  refreshPromise = null;
                });
            }

            const refreshRes = await refreshPromise;
            useAuthStore.getState().setAccessToken(refreshRes.accessToken);

            const retryRequest = request.clone();
            retryRequest.headers.set('Authorization', `Bearer ${refreshRes.accessToken}`);
            return ky(retryRequest, { credentials: 'include' });
          } catch (refreshError) {
            const wasAuthenticated = !!useAuthStore.getState().accessToken;
            useAuthStore.getState().clearAccessToken();
            if (wasAuthenticated) {
              window.location.href = '/login';
            }
            throw refreshError;
          }
        }
      },
    ],
  },
});

export default api;
