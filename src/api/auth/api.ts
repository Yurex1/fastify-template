import * as schemas from './schemas';
import type { AuthApi, Deps } from './types';

export const init = ({ authService }: Deps): AuthApi => ({
  'sign-in': {
    method: 'post',
    access: 'none',
    schema: schemas.signIn,
    handler: async (_user, request) => {
      const { usernameOrEmail, password } = request.body;
      return authService.signIn(usernameOrEmail, password);
    },
  },

  'sign-up': {
    method: 'post',
    access: 'none',
    schema: schemas.signUp,
    handler: async (_user, request) => {
      const { email, username, password } = request.body;
      return await authService.signUp(email, username, password);
    },
  },

  'sign-out': {
    method: 'post',
    access: 'common',
    schema: schemas.signOut,
    handler: async (user, _request) => {
      return authService.signOut(user.id);
    },
  },

  refresh: {
    method: 'post',
    access: 'common',
    schema: schemas.refresh,
    handler: async (user, _request) => {
      return authService.refresh(user.id);
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
