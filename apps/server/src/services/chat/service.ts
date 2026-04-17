import { ChatMemberStatus } from '../../data/chatMember/types';
import { exception } from '../../utils/exception/util';
import type { ChatService, Deps } from './types';

export const init = ({ chatRepo, chatMemberRepo, userRepo, messageRepo, wsServer }: Deps): ChatService => {
  const service: ChatService = {
    create: async (userId, memberId) => {
      if (memberId === userId) {
        throw exception.badRequest('Cannot create chat with yourself');
      }

      const memberExists = await userRepo.existsById(memberId);
      if (!memberExists) {
        throw exception.notFound('USER_NOT_FOUND');
      }

      const existing = await chatMemberRepo.findDirectChat(userId, memberId);
      if (existing) {
        throw exception.badRequest('CHAT_ALREADY_EXIST');
      }

      const chat = await chatRepo.create({});

      await chatMemberRepo.addMembers(chat.id, [
        { userId, status: ChatMemberStatus.APPROVED },
        { userId: memberId, status: ChatMemberStatus.APPROVED },
      ]);

      const member = await userRepo.findOne({ id: memberId });

      return {
        id: chat.id,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        member: {
          id: member!.id,
          username: member!.username,
        },
      };
    },
    list: async (userId, status, page, limit) => {
      return chatMemberRepo.listChatsForUser(userId, status, page, limit);
    },

    sendMessage: async (userId, chatId, text) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('NOT_A_MEMBER');

      const message = await messageRepo.create({ userId, chatId, text });
      const memberIds = await chatMemberRepo.getAllMembersByChatId(Number(chatId));

      memberIds.forEach((id) => {
        if (wsServer.hasConnection(id)) {
          wsServer.send(id, {
            type: 'NEW_MESSAGE',
            payload: {
              ...message,
              chatId: chatId,
            },
          });
        }
      });

      return message;
    },

    getMessagesByChatId: async (userId, chatId, page = 1, limit = 30) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('NOT_A_MEMBER');

      const messages = await messageRepo.findByChatId(chatId, page, limit);
      return messages.reverse();
    },

    updateMessage: async (id, definition) => {
      const existingMessage = await messageRepo.findOne({ id });

      if (!existingMessage) {
        throw exception.notFound('MESSAGE_NOT_FOUND');
      }
      return messageRepo.updateMessage(id, definition);
    },

    removeChat: async (userId, chatId) => {
      const member = await chatMemberRepo.isMember(userId, chatId);
      if (!member) throw exception.forbidden('NOT_A_MEMBER');
      return chatRepo.remove(chatId);
    },
  };

  wsServer.onMessage(async (uid, data) => {
    if (data.type === 'SEND_MESSAGE') {
      const { chatId, text } = data.payload;
      try {
        await service.sendMessage(uid, chatId, text);
      } catch (err) {
        if (wsServer.hasConnection(uid) && err instanceof Error) {
          wsServer.send(uid, {
            type: 'ERROR',
            payload: {
              chatId,
              message: err.message,
            },
          });
        }
        console.error(err);
      }
    }

    if (data.type === 'UPDATE_MESSAGE') {
      const { messageId, text } = data.payload;
      try {
        const updatedMessage = await service.updateMessage(messageId, { text });

        const memberIds = await chatMemberRepo.getAllMembersByChatId(updatedMessage.chatId);
        memberIds.forEach((memberId) => {
          wsServer.send(memberId, {
            type: 'MESSAGE_UPDATED',
            payload: updatedMessage,
          });
        });
      } catch (err: any) {
        wsServer.send(uid, { type: 'ERROR', payload: { message: err.message } });
      }
    }
    if (data.type === 'DELETE_MESSAGE') {
      const { messageId } = data.payload;

      try {
        const msg = await messageRepo.findOne({ id: messageId });
        if (!msg) throw exception.notFound('MESSAGE_NOT_FOUND');

        await messageRepo.remove(messageId);

        const memberIds = await chatMemberRepo.getAllMembersByChatId(msg.chatId);
        memberIds.forEach((memberId) => {
          wsServer.send(memberId, {
            type: 'MESSAGE_DELETED',
            payload: { messageId, chatId: msg.chatId },
          });
        });
      } catch (err: any) {
        wsServer.send(uid, { type: 'ERROR', payload: { message: err.message } });
      }
    }
  });

  return service;
};
