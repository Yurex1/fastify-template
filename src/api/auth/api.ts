import { exception } from '../../utils/exception/util';
import * as schemas from './schemas';
import type { AuthApi, Deps } from './types';

export const init = ({ authService }: Deps): AuthApi => ({
  'sign-in': {
    method: 'post',
    access: 'none',
    schema: schemas.signIn,
    handler: async (_user, request) => {
      const { usernameOrEmail, password } = request.body;
      const deviceId = (request.headers['x-device-id'] as string) || DEFAULT_DEVICE_ID;
      return authService.signIn(usernameOrEmail, password, deviceId);
    },
  },

  'sign-up': {
    method: 'post',
    access: 'none',
    schema: schemas.signUp,
    handler: async (_user, request) => {
      const { email, username, password } = request.body;
      const deviceId = (request.headers['x-device-id'] as string) || DEFAULT_DEVICE_ID;
      return await authService.signUp(email, username, password, deviceId);
    },
  },

  'sign-out': {
    method: 'post',
    access: 'common',
    schema: schemas.signOut,
    handler: async (user, request) => {
      const deviceId = (request.headers['x-device-id'] as string) || DEFAULT_DEVICE_ID;
      return authService.signOut(user.id, deviceId);
    },
  },

  refresh: {
    method: 'post',
    access: 'refresh',
    schema: schemas.refresh,
    handler: async (user, request) => {
      const deviceId = (request.headers['x-device-id'] as string) || DEFAULT_DEVICE_ID;
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        throw exception.unauthorized('NO_TOKEN_PROVIDED');
      }

      return authService.refresh(user.id, deviceId, authHeader.split(' ')[2]);
    },
  },

  'change-password': {
    method: 'put',
    access: 'common',
    schema: schemas.changePassword,
    handler: async (user, request) => {
      const { oldPassword, newPassword } = request.body;
      return authService.changePassword(user.id, oldPassword, newPassword);
    },
  },
});
