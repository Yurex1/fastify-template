import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import websocket from '@fastify/websocket';
import type { WebSocket } from 'ws';
import { WsServer } from './types';
import { Services } from '../services/types';
import { exception } from '../utils/exception/util';
import { CHAT_ACTIONS } from '../services/chat/consts';

export const wsPlugin = fp(async (fastify: FastifyInstance, { services }: { services: Services }) => {
  await fastify.register(websocket);

  const connections = new Map<number, WebSocket>();
  const typingTimers = new Map<number, NodeJS.Timeout>();
  const eventHandlers: Array<(uid: number, data: any) => void> = [];

  const broadcastStatus = async (uid: number, type: string, payload: {}) => {
    try {
      const peers = await services.chat.getAllMembers(uid);

      for (const peer of peers) {
        fastify.ws.send(peer.userId, {
          type: type,
          payload: payload,
        });
      }
    } catch (e) {
      console.error('Broadcast Status Error:', e);
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

      await broadcastStatus(uid, CHAT_ACTIONS.sendStatus, { userId: uid, isOnline: true });

      socket.on('message', async (rawData) => {
        try {
          const data = JSON.parse(rawData.toString());
          const uid = Number(user.id);

          eventHandlers.forEach((handler) => handler(uid, data));

          if (data.type === CHAT_ACTIONS.sendMessage) {
            const { chatId, text } = data.payload;

            const message = await services.chat.sendMessage(uid, chatId, text);

            const members = await services.chat.getAllMembersByChatId(chatId);

            members.forEach((m) => {
              fastify.ws.send(m.userId, {
                type: CHAT_ACTIONS.newMessage,
                payload: message,
              });
            });
          }

          if (data.type === CHAT_ACTIONS.updateMessage) {
            const { messageId, text } = data.payload;

            const updated = await services.chat.updateMessage(messageId, { text });

            const members = await services.chat.getAllMembersByChatId(updated.chatId);

            members.forEach((m) => {
              fastify.ws.send(m.userId, {
                type: CHAT_ACTIONS.updatedMessage,
                payload: updated,
              });
            });
          }

          if (data.type === CHAT_ACTIONS.typing) {
            if (typingTimers.has(uid)) {
              clearTimeout(typingTimers.get(uid)!);
            } else {
              await broadcastStatus(uid, 'IS_TYPING', { userName: user.username, isTyping: true });
            }

            const timer = setTimeout(async () => {
              typingTimers.delete(uid);
              await broadcastStatus(uid, 'STOP_TYPING', { userId: uid, isTyping: false });
            }, 3000);

            typingTimers.set(uid, timer);
          }

          if (data.type === CHAT_ACTIONS.updateReaction) {
            const { id, userId, reaction } = data.payload;
            try {
              const updatedMessage = await services.chat.updateReactions(id, userId, reaction);
              if (!updatedMessage) throw exception.notFound('NOT_FOUND_A_MESSAGE');

              const memberIds = await services.chat.getAllMembersByChatId(updatedMessage.chatId);
              memberIds.forEach((member) => {
                fastify.ws.send(member.userId, {
                  type: CHAT_ACTIONS.updatedReaction,
                  payload: { id: updatedMessage.id, reactions: updatedMessage.reactions },
                });
              });
            } catch (err: unknown) {
              if (err instanceof Error) fastify.ws.send(uid, { type: 'ERROR', payload: { message: err.message } });
            }
          }

          if (data.type === CHAT_ACTIONS.deleteMesage) {
            const { messageId } = data.payload;

            const msg = await services.chat.findMessage({ id: messageId });
            if (!msg) throw new Error('NOT_FOUND');

            await services.chat.removeMessage(messageId);

            const members = await services.chat.getAllMembersByChatId(msg.chatId);

            members.forEach((m) => {
              fastify.ws.send(m.userId, {
                type: CHAT_ACTIONS.deletedMessage,
                payload: { messageId, chatId: msg.chatId },
              });
            });
          }

          if (data.type === CHAT_ACTIONS.getStatus) {
            const { userId, isActive } = data.payload;

            try {
              const memberIds = await services.chat.getAllMembers(userId);

              memberIds.forEach((member) => {
                fastify.ws.send(member.userId, {
                  type: CHAT_ACTIONS.sendStatus,
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
        if (typingTimers.has(uid)) {
          clearTimeout(typingTimers.get(uid)!);
          typingTimers.delete(uid);
        }
        services.user.updateLastSeen(uid).catch(console.error);
        broadcastStatus(uid, CHAT_ACTIONS.sendStatus, { userId: uid, isOnline: false });
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
