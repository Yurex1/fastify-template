import ky from "ky";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../utils/auth/accessToken";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = ky.create({
  baseUrl: BASE_URL,
  credentials: "include",
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = getAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        const userAgent = navigator.userAgent;
        request.headers.set("x-device-id", userAgent);
      },
    ],
    afterResponse: [
      async ({ request, response }) => {
        if (response.status === 401 && !request.url.includes("auth/refresh")) {
          try {
            const refreshRes = await ky
              .post(`${BASE_URL}/auth/refresh`, {
                credentials: "include",
                headers: { "x-device-id": navigator.userAgent },
              })
              .json<{ accessToken: string }>();

            setAccessToken(refreshRes.accessToken);

            return ky(request, {
              headers: {
                ...request.headers,
                Authorization: `Bearer ${refreshRes.accessToken}`,
              },
            });
          } catch (refreshError) {
            console.error("Refresh failed, logging out...");
            clearAccessToken();
            window.location.href = "/login";
            throw refreshError;
          }
        }
      },
    ],
  },
});

export default api;
