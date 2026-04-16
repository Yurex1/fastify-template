import { config } from '../../config';
import { FastifyReply } from 'fastify';

export function setAuthCookie(name: string, reply: FastifyReply, token: string) {
  reply.setCookie(`${name}`, token, {
    path: '/',
    httpOnly: true,
    secure: config.node_env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
