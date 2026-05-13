import { config } from '../../config';
import { FastifyReply } from 'fastify';

export function setAuthCookie(name: string, reply: FastifyReply, token: string) {
  const domain = config.node_env === 'production' ? undefined : 'localhost';
  reply.setCookie(`${name}`, token, {
    path: '/',
    httpOnly: true,
    secure: config.node_env === 'production',
    sameSite: config.node_env === 'production' ? 'strict' : 'lax',
    domain,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
