import type { FastifyReply } from 'fastify';
import { DEFAULT_DEVICE_ID } from '../../data/session/constants';
import { setAuthCookie } from '../cookies/util';
import { AuthService } from '../../services/auth/types';
import { FastifyRequest } from 'fastify/types/request';

export const handleGoogleCallback = async (
  request: FastifyRequest,
  reply: FastifyReply,
  authService: AuthService,
  clientUrl: string,
) => {
  const { token } = await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

  const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  }).then((res) => res.json());

  const { deviceId } = request;

  const session = await authService.signInWithGoogle(userInfo.sub, userInfo.email, userInfo.name, deviceId);

  setAuthCookie('refreshToken', reply, session.refreshToken);

  const userData = Buffer.from(JSON.stringify(session.user)).toString('base64');
  reply.redirect(`${clientUrl}/auth/callback?accessToken=${session.accessToken}&user=${userData}&success=true`);
};
