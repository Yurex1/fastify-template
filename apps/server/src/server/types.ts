import { APIs } from '../api/types';
import { Services } from '../services/types';
import { FastifyPluginAsync, FastifyPluginCallback, FastifyPluginOptions } from 'fastify/types/plugin';
import { UserResult } from '../entities/user';
import { WsAdapter } from '../utils/ws/types';

export interface Deps {
  services: Services;
  apis: APIs;
}

export interface WsServer extends WsAdapter {
  onMessage: (handler: (uid: number, data: unknown) => void) => void;
}

export interface MessageHandlersDeps {
  services: Services;
  fastifyWs: WsServer;
  uid: number;
  user: UserResult;
  typingTimers: Map<number, NodeJS.Timeout>;
}

export type Plugin = {
  plugin: FastifyPluginCallback | FastifyPluginAsync;
  options: FastifyPluginOptions;
};

export type SessionProviderKeys = 'none' | 'access' | 'refresh';

export type SessionProvider = Record<SessionProviderKeys, () => Promise<unknown> | unknown>;
