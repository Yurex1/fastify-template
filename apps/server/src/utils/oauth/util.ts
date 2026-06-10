import type { FastifyReply, FastifyRequest } from 'fastify';
import { setAuthCookie } from '../cookies/util';
import { AuthService } from '../../services/auth/types';
import { exception } from '../exception/util';
import { config } from '../../config';

export const handleGoogleCallback = async (request: FastifyRequest, reply: FastifyReply, authService: AuthService) => {
  const { token } = await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!res.ok) throw exception.serverError(res.statusText);
    const userInfo = await res.json();
    const { deviceId } = request;

    const session = await authService.signInWithGoogle(userInfo.sub, userInfo.email, userInfo.name, deviceId);
    setAuthCookie('refreshToken', reply, session.refreshToken);
    setAuthCookie('accessToken', reply, session.accessToken);
    setAuthCookie('user', reply, JSON.stringify(session.user));

    reply.redirect(`${config.client.url}/auth/callback?status=success`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw exception.isCustomException(err.message);
    }
    console.error(err);
  }
};
