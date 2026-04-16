import { WebSocket, WebSocketServer } from 'ws';
import { APIs } from '../api/types';
import { Services } from '../services/types';
import { FastifyPluginAsync, FastifyPluginCallback, FastifyPluginOptions } from 'fastify/types/plugin';

export interface WsServer {
  server: WebSocketServer;
  connections: Map<number, WebSocket>;
  onMessage: (handler: (uid: number, data: any) => void) => void;
  _listen: () => void;
  hasConnection: (id: number) => boolean;
  send: (id: number, message: object) => void;
}

export interface Deps {
  services: Services;
  apis: APIs;
}

export type Plugin = {
  plugin: FastifyPluginCallback | FastifyPluginAsync;
  options: FastifyPluginOptions;
};

export type SessionProviderKeys = 'none' | 'access' | 'refresh';

export type SessionProvider = Record<SessionProviderKeys, () => Promise<unknown> | unknown>;
