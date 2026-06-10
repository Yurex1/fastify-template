import { config } from '../../config';
import { FastifyReply } from 'fastify';
import ms, { StringValue } from 'ms';

export function setAuthCookie(name: string, reply: FastifyReply, token: string) {
  const isProduction = config.node_env === 'production';

  const refreshExpiration = config.jwt.expiration.refresh as StringValue;
  const msExpiration = ms(refreshExpiration);
  const secondsExpiration = msExpiration ? Math.floor(msExpiration / 1000) : 604800;
  reply.setCookie(name, token, {
    path: '/',
    httpOnly: isProduction,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: secondsExpiration,
  });
}
