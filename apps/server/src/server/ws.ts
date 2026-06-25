import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import websocket from '@fastify/websocket';
import { WebSocket } from 'ws';
import { WsServer } from './types';
import { Services } from '../services/types';
import { exception } from '../utils/exception/util';
import { CHAT_ACTIONS } from '../services/chat/consts';

import { createMessageHandlers } from './messageHandlers';
import { CALL_ACTIONS } from '../services/livekit/consts';
import { getValidator } from './validation';
import { createDispatch } from './dispatch';

export const wsPlugin = fp(async (fastify: FastifyInstance, { services }: { services: Services }) => {
  await fastify.register(websocket, {
    options: {
      maxPayload: 512 * 1024,
    },
  });

  const connections = new Map<number, Map<string, WebSocket>>();
  const typingTimers = new Map<number, NodeJS.Timeout>();
  const heartbeatStates = new Map<
    string,
    {
      isAlive: boolean;
      timer: NodeJS.Timeout;
    }
  >();
  const eventHandlers: Array<(uid: number, data: unknown) => void> = [];
  const PING_INTERVAL_MS = 25000;

  const cleanupConnection = (uid: number, deviceId: string) => {
    const connectionKey = `${uid}:${deviceId}`;
    const userConnections = connections.get(uid);

    if (userConnections) {
      userConnections.delete(deviceId);

      if (userConnections.size === 0) {
        connections.delete(uid);
      }
    }

    const heartbeat = heartbeatStates.get(connectionKey);

    if (heartbeat) {
      clearInterval(heartbeat.timer);
      heartbeatStates.delete(connectionKey);
    }

    if (!connections.has(uid) && typingTimers.has(uid)) {
      clearTimeout(typingTimers.get(uid));
      typingTimers.delete(uid);
    }
  };

  const dispatch = createDispatch(fastify);

  fastify.get<{ Querystring: { deviceId: string } }>('/ws', { websocket: true }, async (socket, req) => {
    try {
      const token = req.headers['sec-websocket-protocol'];

      if (!token) {
        throw exception.unauthorized('NO_TOKEN_PROVIDED');
      }

      const user = await services.auth.verify('access', token);
      const uid = Number(user.id);

      if (!req.query.deviceId) {
        throw exception.badRequest('DEVICE_ID_REQUIRED');
      }
      const deviceId = String(req.query.deviceId);
      const connectionKey = `${uid}:${deviceId}`;

      if (!connections.has(uid)) {
        connections.set(uid, new Map());
      }

      const existingSocket = connections.get(uid)?.get(deviceId);

      if (existingSocket && existingSocket.readyState === 1) {
        const oldKey = `${uid}:${deviceId}`;

        const oldHeartbeat = heartbeatStates.get(oldKey);

        if (oldHeartbeat) {
          clearInterval(oldHeartbeat.timer);
          heartbeatStates.delete(oldKey);
        }

        existingSocket?.close();
      }

      connections.get(uid)?.set(deviceId, socket);

      const handlers = createMessageHandlers({ services, fastifyWs: fastify.ws, uid, user, typingTimers });

      const heartbeatTimer = setInterval(() => {
        const state = heartbeatStates.get(connectionKey);

        if (!state || socket.readyState !== 1) {
          return;
        }

        if (!state.isAlive) {
          socket.terminate();
          return;
        }

        state.isAlive = false;

        try {
          socket.ping();
        } catch {
          socket.terminate();
        }
      }, PING_INTERVAL_MS);

      socket.on('pong', () => {
        const state = heartbeatStates.get(connectionKey);
        if (state) {
          state.isAlive = true;
        }
      });

      heartbeatStates.set(connectionKey, {
        isAlive: true,
        timer: heartbeatTimer,
      });

      await handlers.broadcastStatus(uid, CHAT_ACTIONS.sendStatus, { userId: uid, isOnline: true });
      await handlers.handleInitialStatuses();

      socket.on('message', async (rawData) => {
        try {
          const data = JSON.parse(rawData.toString());
          const uid = Number(user.id);

          if (typeof data?.type !== 'string') {
            return;
          }

          const validate = getValidator(data.type);

          if (validate && !validate(data.payload)) {
            fastify.ws.send(uid, {
              type: 'ERROR',
              payload: {
                action: data.type,
                success: false,
                error: {
                  code: 400,
                  message:
                    validate.errors?.map((e) => `${e.instancePath || 'payload'}: ${e.message}`).join('; ') ??
                    'Validation error',
                },
                data: null,
              },
            });
            return;
          }

          eventHandlers.forEach((handler) => handler(uid, data));

          const actionMap = {
            [CHAT_ACTIONS.sendMessage]: handlers.handleSendMessage,
            [CHAT_ACTIONS.updateMessage]: handlers.handleUpdateMessage,
            [CHAT_ACTIONS.typing]: handlers.handleTyping,
            [CHAT_ACTIONS.updateReaction]: handlers.handleUpdateReaction,
            [CHAT_ACTIONS.deleteMesage]: handlers.handleDeleteMessage,
            [CALL_ACTIONS.outgoing]: handlers.handleCreateRoom,
          };

          const action = actionMap[data.type];
          if (action) await dispatch(uid, () => action(data));
        } catch (e) {
          console.error(e);
        }
      });

      socket.on('close', () => {
        const currentSocket = connections.get(uid)?.get(deviceId);

        if (currentSocket !== socket) {
          return;
        }

        const isLastConnection = connections.get(uid)?.size === 1;

        if (isLastConnection) {
          services.user.updateLastSeen(uid).catch(console.error);

          handlers.broadcastStatus(uid, CHAT_ACTIONS.sendStatus, {
            userId: uid,
            isOnline: false,
            lastseen: new Date(),
          });
        }

        cleanupConnection(uid, deviceId);
      });

      socket.on('error', (err) => {
        console.error(`WS Error [${uid}:${deviceId}]:`, err);
        cleanupConnection(uid, deviceId);
      });
    } catch (e: unknown) {
      if (e instanceof Error) console.error('WS Auth Error:', e.message);

      if (socket) {
        socket.close(1008, 'Authentication failed');
      }
    }
  });

  fastify.decorate('ws', {
    onMessage(handler: (uid: number, data: unknown) => void) {
      eventHandlers.push(handler);
    },

    hasConnection(id: number): boolean {
      const userConnections = connections.get(id);

      if (!userConnections) {
        return false;
      }

      for (const socket of userConnections.values()) {
        if (socket.readyState === 1) {
          return true;
        }
      }

      connections.delete(id);
      return false;
    },

    hasConnectionForDevice(userId: number, deviceId: string): boolean {
      const socket = connections.get(userId)?.get(deviceId);

      if (!socket) {
        return false;
      }

      return socket.readyState === WebSocket.OPEN;
    },

    send(id: number, message: object) {
      const userConnections = connections.get(id);

      if (!userConnections) return;

      for (const socket of userConnections.values()) {
        if (socket.readyState === 1) {
          socket.send(JSON.stringify(message));
        }
      }
    },
  } as WsServer);
});
