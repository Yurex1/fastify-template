import ky from 'ky';
import { ERROR_STATUSES } from '../utils/consts/errorStatus';
import useUserStore from '../stores/user';
const userAgent = navigator.userAgent;

const BASE_URL = import.meta.env.VITE_API_URL;

const api = ky.create({
  baseUrl: BASE_URL,
  credentials: 'include',
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = useUserStore.getState().accessToken;
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
              .post(`${BASE_URL}/auth/refresh`, {
                credentials: 'include',
                headers: { 'x-device-id': userAgent },
              })
              .json<{ accessToken: string }>();
            useUserStore.getState().setAccessToken(refreshRes.accessToken);

            return ky(request, {
              headers: {
                ...request.headers,
                Authorization: `Bearer ${refreshRes.accessToken}`,
              },
            });
          } catch (refreshError) {
            console.error('Refresh failed, logging out...');

            useUserStore.getState().clearAccessToken();
            window.location.href = '/login';
            throw refreshError;
          }
        }
      },
    ],
  },
});

export default api;
