import { config } from '../../config';
import { FastifyReply } from 'fastify';

export function setAuthCookie(name: string, reply: FastifyReply, token: string) {
  const isProduction = config.node_env === 'production';

  reply.setCookie(name, token, {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60,
  });
}
