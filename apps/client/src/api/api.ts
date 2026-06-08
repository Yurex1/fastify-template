import ky from 'ky';
import { useAuthStore } from '../stores/auth';
import type { User } from './user/types';

import { getDeviceId } from '../utils/deviceId';
import { createApiError } from './apiError';
import useUserStore from '../stores/user';

const deviceId = getDeviceId();
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
        request.headers.set('x-device-id', deviceId);
        request.headers.set('accept-language', useUserStore.getState().language);
      },
    ],

    afterResponse: [
      async ({ request, response }) => {
        if (request.url.includes('auth/refresh')) {
          if (response.status >= 400) {
            const body = await response
              .clone()
              .json()
              .catch(() => ({}));
            const error = createApiError(response.status, body?.message ?? `HTTP ${response.status}`);
            throw error;
          }
          return;
        }

        if (response.status === 401) {
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
          } catch {
            const wasAuthenticated = !!useAuthStore.getState().accessToken;
            useAuthStore.getState().clearAccessToken();
            if (wasAuthenticated) window.location.href = '/login';
            throw new Error('Session expired');
          }
        }

        if (response.status >= 400) {
          const body = await response
            .clone()
            .json()
            .catch(() => ({}));

          const errorMessage =
            (body?.code === 'FST_ERR_VALIDATION' ? body.message : null) ??
            body?.message ??
            body?.error ??
            `HTTP ${response.status}`;

          throw createApiError(response.status, errorMessage);
        }
      },
    ],
  },
});

export default api;
