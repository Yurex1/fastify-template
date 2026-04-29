import 'fastify';
import { WsServer } from '../server/ws/types';

declare module 'fastify' {
  interface FastifyInstance {
    ws: WsServer;
  }
}
