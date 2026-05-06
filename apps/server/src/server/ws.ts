import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import websocket from '@fastify/websocket';
import type { WebSocket } from 'ws';
import { WsServer } from './types';
import { Services } from '../services/types';
import { exception } from '../utils/exception/util';
import { CHAT_ACTIONS } from '../services/chat/consts';

import { createMessageHandlers } from './messageHandlers';

export const wsPlugin = fp(async (fastify: FastifyInstance, { services }: { services: Services }) => {
  await fastify.register(websocket);

  const connections = new Map<number, WebSocket>();
  const typingTimers = new Map<number, NodeJS.Timeout>();
  const heartbeatStates = new Map<number, { isAlive: boolean; timer: NodeJS.Timeout }>();
  const eventHandlers: Array<(uid: number, data: any) => void> = [];
  const PING_INTERVAL_MS = 25000;

  const cleanupConnection = (uid: number) => {
    const heartbeat = heartbeatStates.get(uid);
    if (heartbeat) {
      clearInterval(heartbeat.timer);
      heartbeatStates.delete(uid);
    }
    connections.delete(uid);
    if (typingTimers.has(uid)) {
      clearTimeout(typingTimers.get(uid)!);
      typingTimers.delete(uid);
    }
  };

  fastify.get<{ Querystring: { token: string } }>('/ws', { websocket: true }, async (socket, req) => {
    try {
      const { token } = req.query;

      if (!token) {
        throw exception.unauthorized('NO_TOKEN_PROVIDED');
      }

      const user = await services.auth.verify('access', token);
      const uid = Number(user.id);

      connections.set(uid, socket);

      const handlers = createMessageHandlers({ services, fastifyWs: fastify.ws, uid, user });

      const heartbeatTimer = setInterval(() => {
        const state = heartbeatStates.get(uid);
        if (!state || socket.readyState !== 1) return;

        if (!state.isAlive) {
          socket.terminate();
          return;
        }

        state.isAlive = false;
        try {
          socket.ping();
        } catch (error) {
          socket.terminate();
        }
      }, PING_INTERVAL_MS);

      socket.on('pong', () => {
        const state = heartbeatStates.get(uid);
        if (state) {
          state.isAlive = true;
        }
      });

      heartbeatStates.set(uid, { isAlive: true, timer: heartbeatTimer });

      await handlers.broadcastStatus(uid, CHAT_ACTIONS.sendStatus, { userId: uid, isOnline: true });

      socket.on('message', async (rawData) => {
        try {
          const data = JSON.parse(rawData.toString());

          const uid = Number(user.id);

          eventHandlers.forEach((handler) => handler(uid, data));

          if (data.type === CHAT_ACTIONS.sendMessage) {
            await handlers.handleSendMessage(data);
          }

          if (data.type === CHAT_ACTIONS.updateMessage) {
            await handlers.handleUpdateMessage(data);
          }

          if (data.type === CHAT_ACTIONS.typing) {
            await handlers.handleTyping(typingTimers);
          }

          if (data.type === CHAT_ACTIONS.updateReaction) {
            await handlers.handleUpdateReaction(data);
          }

          if (data.type === CHAT_ACTIONS.deleteMesage) {
            await handlers.handleDeleteMessage(data);
          }
        } catch (e) {
          console.error(e);
        }
      });

      socket.on('close', () => {
        cleanupConnection(uid);
        services.user.updateLastSeen(uid).catch(console.error);
        handlers.broadcastStatus(uid, CHAT_ACTIONS.sendStatus, { userId: uid, isOnline: false });
        connections.delete(uid);
        if (typingTimers.has(uid)) {
          clearTimeout(typingTimers.get(uid)!);
          typingTimers.delete(uid);
        }
        services.user.updateLastSeen(uid).catch(console.error);
      });
    } catch (e: any) {
      console.error('WS Auth Error:', e.message);

      if (socket) {
        socket.close(1008, 'Authentication failed');
      }
    }
  });

  fastify.decorate('ws', {
    onMessage(handler: (uid: number, data: any) => void) {
      eventHandlers.push(handler);
    },

    hasConnection(id: number): boolean {
      const socket = connections.get(id);
      if (!socket) return false;
      if (socket.readyState !== 1) {
        connections.delete(id);
        return false;
      }
      return true;
    },

    send(id: number, message: object) {
      const socket = connections.get(id);
      if (socket && socket.readyState === 1) {
        socket.send(JSON.stringify(message));
      }
    },
  } as WsServer);
});
