import { setAuthCookie } from '../../utils/cookies/util';
import { DEFAULT_DEVICE_ID } from '../../data/session/constants';
import { exception } from '../../utils/exception/util';
import * as schemas from './schemas';
import type { AuthApi, Deps } from './types';
import { sessions } from '../../utils/sessions/utils';
import { handleGoogleCallback } from '../../utils/oauth/util';
import { config } from '../../config';

export const init = ({ authService }: Deps): AuthApi => ({
  'sign-in': {
    method: 'post',
    access: 'none',
    schema: schemas.signIn,
    handler: async (_user, request, reply) => {
      const { usernameOrEmail, password } = request.body;
      const { lang, deviceId } = request;

      const user = await authService.signIn(usernameOrEmail, password, deviceId, lang);
      setAuthCookie('refreshToken', reply, user.refreshToken);
      return sessions.toSessionResponse(user);
    },
  },

  'sign-up': {
    method: 'post',
    access: 'none',
    schema: schemas.signUp,
    handler: async (_user, request, reply) => {
      const { email, username, password } = request.body;
      const { lang, deviceId } = request;

      const user = await authService.signUp(email, username, password, deviceId, lang);
      setAuthCookie('refreshToken', reply, user.refreshToken);
      return sessions.toSessionResponse(user);
    },
  },

  'sign-out': {
    method: 'post',
    access: 'access',
    schema: schemas.signOut,
    handler: async (user, request, reply) => {
      const { lang, deviceId } = request;

      reply.clearCookie('refreshToken', { path: '/' });
      return authService.signOut(user.id, deviceId, lang);
    },
  },

  refresh: {
    method: 'post',
    access: 'refresh',
    schema: schemas.refresh,
    handler: async (user, request, reply) => {
      const { deviceId } = request;
      const currentToken = request.cookies.refreshToken;

      if (!currentToken) {
        throw exception.unauthorized('REFRESH_TOKEN_MISSING');
      }
      const session = await authService.refresh(user.id, deviceId, currentToken);
      setAuthCookie('refreshToken', reply, session.refreshToken);

      return {
        accessToken: session.accessToken,
        user: session.user,
        expiresAt: session.expiresAt.toISOString(),
      };
    },
  },

  'change-password': {
    method: 'put',
    access: 'access',
    schema: schemas.changePassword,
    handler: async (user, request) => {
      const { oldPassword, newPassword } = request.body;
      const { lang } = request;

      return authService.changePassword(user.id, oldPassword, newPassword, lang);
    },
  },

  'google/callback': {
    method: 'get',
    access: 'none',
    schema: schemas.googleCallback,
    handler: async (_user, request, reply) => {
      try {
        await handleGoogleCallback(request, reply, authService, config.client.url);
      } catch (err: any) {
        console.error('Google OAuth Error:', err);
        reply.redirect('/login?error=oauth_failed');
      }
    },
  },
});
