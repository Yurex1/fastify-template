import { Services } from '../services/types';
import { init as apiInit } from './healthCheck/api';
import { init as userApiInit } from './user/api';
import { init as authApiInit } from './auth/api';
import { APIs } from './types';

export const init = (services: Services): APIs => {
  const api = apiInit({ service: services.service, notification: services.notification });
  const user = userApiInit({ userService: services.user });
  const auth = authApiInit({ authService: services.auth });

  return {
    api,
    user,
    auth,
  };
};
