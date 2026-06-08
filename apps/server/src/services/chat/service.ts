import { ChatMemberStatus } from '../../data/chatMember/types';
import { ChatPreview } from '../../entities/chat';
import { t } from '../../utils/i18n/util';
import { server } from '../../server/http';
import { exception } from '../../utils/exception/util';
import { CHAT_ACTIONS } from './consts';
import type { ChatService, Deps } from './types';

export const init = (deps: Deps): ChatService => {
  const { chatRepo, chatMemberRepo, userRepo, messageRepo, pinnedMessagesRepo } = deps;

  const service: ChatService = {
    create: async (userId, memberId, lang) => {
      if (memberId === userId) {
        throw exception.badRequest(t('chat.errors.selfChat', lang));
      }
      const memberExists = await userRepo.existsById(memberId);
      if (!memberExists) throw exception.notFound(t('auth.errors.notFound', lang));

      const existing = await chatMemberRepo.findDirectChat(userId, memberId);
      if (existing) throw exception.badRequest(t('chat.errors.alreadyExists', lang));

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
            payload: {
              id: chat.id,
              createdAt: chat.createdAt,
              updatedAt: chat.updatedAt,
              members,
            },
          });
        }
      }

      return {
        id: chat.id,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        members,
        lastMessage: null,
      };
    },

    list: async (userId, status, cursor, limit = 50) => {
      return chatMemberRepo.listChatsForUser(userId, status, cursor, limit);
    },

    getAllMembers: async (userId) => {
      return chatMemberRepo.getAllMembers(userId);
    },

    getAllMembersByChatId: async (chatId) => {
      return chatMemberRepo.getAllMembersByChatId(chatId);
    },

    getAllPinnedMessages: async (chatId, cursor, limit = 50) => {
      return pinnedMessagesRepo.findByChatId(chatId, cursor, limit);
    },

    findMessage: async (definition) => {
      return messageRepo.findOne(definition);
    },

    removeMessage: async (id) => {
      return messageRepo.remove(id);
    },

    sendMessage: async (userId, chatId, text, lang, reply_id) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden(t('chat.errors.forbidden', lang));

      const message = await messageRepo.create({ userId, chatId, text, reply_id: reply_id || null });
      await chatRepo.update(chatId, { updatedAt: new Date() });

      return message;
    },

    getMessagesByChatId: async (userId, chatId, { before, after, limit }, lang) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden(t('chat.errors.forbidden', lang));

      return await messageRepo.findByChatId(chatId, { before, after, limit });
    },

    searchMessagesByChatId: async (userId, chatId, text, lang) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) if (!isMember) throw exception.forbidden(t('chat.errors.forbidden', lang));

      return await messageRepo.findAllByChatId(chatId, text);
    },

    updateMessage: async (id, definition, lang) => {
      const existing = await messageRepo.findOne({ id });
      if (!existing) throw exception.notFound(t('chat.errors.messageNotFound', lang));

      return messageRepo.updateMessage(id, definition);
    },

    updateReactions: async (id, userId, reaction, lang) => {
      const existingMessage = await messageRepo.findOne({ id });

      if (!existingMessage) {
        throw exception.notFound(t('chat.errors.messageNotFound', lang));
      }

      return messageRepo.updateReactions(id, userId, reaction);
    },

    getMessageContext: async (userId, chatId, messageId, limit, lang) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden(t('chat.errors.forbidden', lang));

      return await messageRepo.getMessageContext(chatId, messageId, limit);
    },

    pinMessage: async (userId, chatId, messageId, lang) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden(t('chat.errors.forbidden', lang));

      const message = await messageRepo.findOne({ id: messageId });
      if (!message) throw exception.notFound(t('chat.errors.messageNotFound', lang));
      if (message.chatId !== chatId) throw exception.forbidden(t('chat.errors.cannotPin', lang));

      const isAlreadyPinned = await pinnedMessagesRepo.findOne({ message_id: messageId });
      if (isAlreadyPinned) {
        throw exception.badRequest(t('chat.errors.alreadyPinned', lang));
      }

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

    unpinMessage: async (userId, chatId, messageId, lang) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden(t('chat.errors.forbidden', lang));

      const removed = await pinnedMessagesRepo.removeByMessageId(chatId, messageId);
      const members = await chatMemberRepo.getAllMembersByChatId(chatId);

      for (const member of members) {
        if (server.ws.hasConnection(member.userId)) {
          server.ws.send(member.userId, {
            type: CHAT_ACTIONS.unpinnedMessage,
            payload: { messageId, chatId },
          });
        }
      }

      return removed;
    },

    removeChat: async (userId, chatId, lang) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden(t('chat.errors.forbidden', lang));
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
