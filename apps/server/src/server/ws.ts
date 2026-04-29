import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import websocket from '@fastify/websocket';
import type { WebSocket } from 'ws';
import { Repos } from '../data/types';
import { WsServer } from './types';
import { Services } from '../services/types';
import { exception } from '../utils/exception/util';

export const wsPlugin = fp(async (fastify: FastifyInstance, { services }: { repos: Repos; services: Services }) => {
  await fastify.register(websocket);

  const connections = new Map<number, WebSocket>();
  const eventHandlers: Array<(uid: number, data: any) => void> = [];

  const broadcastStatus = async (uid: number, isActive: boolean) => {
    try {
      const peers = await services.chat.getAllMembersByChatId(uid);
      for (const peer of peers) {
        if (fastify.ws.hasConnection(peer.userId)) {
          fastify.ws.send(peer.userId, {
            type: 'USER_STATUS',
            payload: { userId: uid, isActive },
          });
        }
      }
    } catch (e) {
      console.error('Broadcast Status Error:', e);
    }
  };

  const sendOnlinePeers = async (uid: number) => {
    try {
      const peers = await services.chat.getAllMembers(uid);
      const onlineIds = peers.filter((p) => fastify.ws.hasConnection(p.userId)).map((p) => p.userId);

      if (onlineIds.length > 0) {
        fastify.ws.send(uid, {
          type: 'INITIAL_STATUS_SYNC',
          payload: { onlineIds },
        });
      }
    } catch (e) {
      console.error('Initial Status Sync Error:', e);
    }
  };

  fastify.get<{ Querystring: { token: string } }>('/ws', { websocket: true }, async (socket, req) => {
    try {
      const { token } = req.query;

      if (!token) throw new Error('NO_TOKEN_PROVIDED');

      const user = await services.auth.verify('access', token);
      const uid = Number(user.id);

      connections.set(uid, socket);

      await broadcastStatus(uid, true);
      setTimeout(() => sendOnlinePeers(uid), 150);

      socket.on('message', async (rawData) => {
        try {
          const data = JSON.parse(rawData.toString());

          if (data.type === 'SEND_MESSAGE') {
            const { chatId, text } = data.payload;

            const message = await services.chat.sendMessage(uid, chatId, text);

            const members = await services.chat.getAllMembersByChatId(chatId);

            members.forEach((m) => {
              fastify.ws.send(m.userId, {
                type: 'NEW_MESSAGE',
                payload: message,
              });
            });
          }

          if (data.type === 'UPDATE_MESSAGE') {
            const { messageId, text } = data.payload;

            const updated = await services.chat.updateMessage(messageId, { text });

            const members = await services.chat.getAllMembersByChatId(updated.chatId);

            members.forEach((m) => {
              fastify.ws.send(m.userId, {
                type: 'MESSAGE_UPDATED',
                payload: updated,
              });
            });
          }

          if (data.type === 'UPDATE_REACTION') {
            const { id, userId, reaction } = data.payload;
            try {
              const updatedMessage = await services.chat.updateReactions(id, userId, reaction);
              if (!updatedMessage) throw exception.notFound('NOT_FOUND_A_MESSAGE');

              const memberIds = await services.chat.getAllMembersByChatId(updatedMessage.chatId);
              memberIds.forEach((member) => {
                fastify.ws.send(member.userId, {
                  type: 'MESSAGE_REACTIONS_UPDATED',
                  payload: { id: updatedMessage.id, reactions: updatedMessage.reactions },
                });
              });
            } catch (err: unknown) {
              if (err instanceof Error) fastify.ws.send(uid, { type: 'ERROR', payload: { message: err.message } });
            }
          }

          if (data.type === 'DELETE_MESSAGE') {
            const { messageId } = data.payload;

            const msg = await services.chat.findMessage({ id: messageId });
            if (!msg) throw new Error('NOT_FOUND');

            await services.chat.removeMessage(messageId);

            const members = await services.chat.getAllMembersByChatId(msg.chatId);

            members.forEach((m) => {
              fastify.ws.send(m.userId, {
                type: 'MESSAGE_DELETED',
                payload: { messageId, chatId: msg.chatId },
              });
            });
          }

          if (data.type === 'USER_STATUS') {
            const { userId, isActive } = data.payload;

            try {
              const memberIds = await services.chat.getAllMembers(userId);

              memberIds.forEach((member) => {
                fastify.ws.send(member.userId, {
                  type: 'STATUS',
                  payload: { userId, isActive },
                });
              });
            } catch (err: unknown) {
              if (err instanceof Error) fastify.ws.send(uid, { type: 'ERROR', payload: { message: err.message } });
            }
          }
        } catch (e) {
          console.error(e);
        }
      });
      socket.on('close', () => {
        connections.delete(uid);
        services.user.updateLastSeen(uid).catch(console.error);
        broadcastStatus(uid, false);
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
