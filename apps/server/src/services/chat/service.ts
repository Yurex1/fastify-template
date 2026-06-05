import { ChatMemberStatus } from '../../data/chatMember/types';
import { ChatPreview } from '../../entities/chat';
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
      if (!memberExists) throw exception.notFound('No account found with this username or email');

      const existing = await chatMemberRepo.findDirectChat(userId, memberId);
      if (existing) throw exception.badRequest('Chat already exist');

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

    sendMessage: async (userId, chatId, text, reply_id) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('You are not a member of this chat');

      const message = await messageRepo.create({ userId, chatId, text, reply_id: reply_id || null });
      await chatRepo.update(chatId, { updatedAt: new Date() });

      return message;
    },

    getMessagesByChatId: async (userId, chatId, { before, after, limit }) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('You are not a member of this chat');

      return await messageRepo.findByChatId(chatId, { before, after, limit });
    },

    searchMessagesByChatId: async (userId, chatId, text) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('You are not a member of this chat');

      return await messageRepo.findAllByChatId(chatId, text);
    },

    updateMessage: async (id, definition) => {
      const existing = await messageRepo.findOne({ id });
      if (!existing) throw exception.notFound('Message not found');

      return messageRepo.updateMessage(id, definition);
    },

    updateReactions: async (id, userId, reaction) => {
      const existingMessage = await messageRepo.findOne({ id });

      if (!existingMessage) {
        throw exception.notFound('Message not found');
      }

      return messageRepo.updateReactions(id, userId, reaction);
    },

    getMessageContext: async (userId, chatId, messageId, limit) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('You are not a member of this chat');

      return await messageRepo.getMessageContext(chatId, messageId, limit);
    },

    pinMessage: async (userId, chatId, messageId) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('You are not a member of this chat');

      const message = await messageRepo.findOne({ id: messageId });
      if (!message) throw exception.notFound('Message not found');
      if (message.chatId !== chatId) throw exception.forbidden('Cannot pin this message');

      const isAlreadyPinned = await pinnedMessagesRepo.findOne({ message_id: messageId });
      if (isAlreadyPinned) {
        throw exception.badRequest('Message already pinned');
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

    unpinMessage: async (userId, chatId, messageId) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('You are not a member of this chat');

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

    removeChat: async (userId, chatId) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('You are not a member of this chat');
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
