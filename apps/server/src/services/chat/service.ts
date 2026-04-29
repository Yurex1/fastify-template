import { ChatMemberStatus } from '../../data/chatMember/types';
import { exception } from '../../utils/exception/util';
import type { ChatService, Deps } from './types';

export const init = (deps: Deps): ChatService => {
  const { chatRepo, chatMemberRepo, userRepo, messageRepo } = deps;

  const service: ChatService = {
    create: async (userId, memberId) => {
      if (memberId === userId) {
        throw exception.badRequest('Cannot create chat with yourself');
      }

      const memberExists = await userRepo.existsById(memberId);
      if (!memberExists) throw exception.notFound('USER_NOT_FOUND');

      const existing = await chatMemberRepo.findDirectChat(userId, memberId);
      if (existing) throw exception.badRequest('CHAT_ALREADY_EXIST');

      const chat = await chatRepo.create({});

      await chatMemberRepo.addMembers(chat.id, [
        { userId, status: ChatMemberStatus.APPROVED },
        { userId: memberId, status: ChatMemberStatus.APPROVED },
      ]);

      const members = await chatMemberRepo.getAllMembersByChatId(chat.id);

      return {
        id: chat.id,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        members,
      };
    },

    list: async (userId, status, page = 1, limit = 20) => {
      return chatMemberRepo.listChatsForUser(userId, status, page, limit);
    },

    sendMessage: async (userId, chatId, text) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('NOT_A_MEMBER');

      const message = await messageRepo.create({ userId, chatId, text });
      await chatRepo.update(chatId, { updatedAt: new Date() });

      return message;
    },

    getMessagesByChatId: async (userId, chatId, page = 1, limit = 30) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('NOT_A_MEMBER');

      return await messageRepo.findByChatId(chatId, page, limit);
    },

    updateMessage: async (id, definition) => {
      const existing = await messageRepo.findOne({ id });
      if (!existing) throw exception.notFound('MESSAGE_NOT_FOUND');

      return messageRepo.updateMessage(id, definition);
    },

    updateReactions: async (id, userId, reaction) => {
      const existingMessage = await messageRepo.findOne({ id });

      if (!existingMessage) {
        throw exception.notFound('MESSAGE_NOT_FOUND');
      }

      return messageRepo.updateReactions(id, userId, reaction);
    },

    removeChat: async (userId, chatId) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('NOT_A_MEMBER');
      return chatRepo.remove(chatId);
    },
  };

  return service;
};
