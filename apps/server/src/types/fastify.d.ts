import 'fastify';
import { WsServer } from '../server/ws/types';
import { OAuth2Namespace } from '@fastify/oauth2';

declare module 'fastify' {
  interface FastifyInstance {
    ws: WsServer;
    googleOAuth2: OAuth2Namespace;
  }

  interface FastifyRequest {
    deviceId: string;
  }
}
