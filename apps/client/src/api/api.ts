import ky from 'ky';
import { ERROR_STATUSES } from '../utils/consts/errorStatus';
import { useAuthStore } from '../stores/auth';
import type { User } from './user/types';

const userAgent = navigator.userAgent;

const api = ky.create({
  baseUrl: import.meta.env.VITE_API_URL,
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
            const refreshRes = await ky
              .post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                credentials: 'include',
                headers: { 'x-device-id': userAgent },
              })
              .json<{ accessToken: string; user: User; expiresAt: string }>();

            useAuthStore.getState().setAccessToken(refreshRes.accessToken);

            return ky(request, {
              headers: {
                ...request.headers,
                Authorization: `Bearer ${refreshRes.accessToken}`,
              },
            });
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
