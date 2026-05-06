import { ChatMemberStatus } from '../../data/chatMember/types';
import { server } from '../../server/http';
import { exception } from '../../utils/exception/util';
import { CHAT_ACTIONS } from './consts';
import type { ChatService, Deps } from './types';

export const init = (deps: Deps): ChatService => {
  const { chatRepo, chatMemberRepo, userRepo, messageRepo, pinnedMessagesRepo } = deps;

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

      for (const member of members) {
        if (server.ws.hasConnection(member.userId)) {
          server.ws.send(member.userId, {
            type: CHAT_ACTIONS.created,
            payload: chat,
          });
        }
      }

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

    getAllMembers: async (userId) => {
      return chatMemberRepo.getAllMembers(userId);
    },

    getAllMembersByChatId: async (chatId) => {
      return chatMemberRepo.getAllMembersByChatId(chatId);
    },

    getAllPinnedMessages: async (chatId, page = 1, limit = 20) => {
      return pinnedMessagesRepo.findByChatId(chatId, page, limit);
    },

    findMessage: async (definition) => {
      return messageRepo.findOne(definition);
    },

    removeMessage: async (id) => {
      return messageRepo.remove(id);
    },

    sendMessage: async (userId, chatId, text, reply_id) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('NOT_A_MEMBER');

      const message = await messageRepo.create({ userId, chatId, text, reply_id: reply_id || null });
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

    pinMessage: async (userId, chatId, messageId) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('NOT_A_MEMBER');

      const message = await messageRepo.findOne({ id: messageId });
      if (!message) throw exception.notFound('MESSAGE_NOT_FOUND');

      const pinned = await pinnedMessagesRepo.create({
        chat_id: chatId,
        message_id: messageId,
        pinned_at: new Date(),
      });

      const members = await chatMemberRepo.getAllMembersByChatId(chatId);

      for (const member of members) {
        if (server.ws.hasConnection(member.userId)) {
          server.ws.send(member.userId, {
            type: CHAT_ACTIONS.pinnedMessage,
            payload: {
              chatId,
              messageId,
              isPinned: true,
              pinnedAt: pinned.pinned_at,
              message,
            },
          });
        }
      }

      return pinned;
    },

    unpinMessage: async (userId, chatId, messageId) => {
      const removed = await pinnedMessagesRepo.removeByMessageId(chatId, messageId);

      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('NOT_A_MEMBER');
      const members = await chatMemberRepo.getAllMembersByChatId(chatId);

      for (const member of members) {
        if (server.ws.hasConnection(member.userId)) {
          server.ws.send(member.userId, {
            type: CHAT_ACTIONS.unpinedMessage,
            payload: { messageId, chatId },
          });
        }
      }

      return removed;
    },

    removeChat: async (userId, chatId) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('NOT_A_MEMBER');
      const members = await chatMemberRepo.getAllMembersByChatId(chatId);

      for (const member of members) {
        if (server.ws.hasConnection(member.userId)) {
          server.ws.send(member.userId, {
            type: CHAT_ACTIONS.deleted,
            payload: chatId,
          });
        }
      }

      return chatRepo.remove(chatId);
    },
  };

  return service;
};
