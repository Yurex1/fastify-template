import { ChatMemberStatus } from '../../data/chatMember/types';
import { exception } from '../../utils/exception/util';
import { CHAT_ACTIONS } from './consts';
import type { ChatService, Deps } from './types';

export const init = (deps: Deps): ChatService => {
  const { chatRepo, chatMemberRepo, userRepo, messageRepo, pinnedMessagesRepo, chatNotificationService, ws } = deps;

  const service: ChatService = {
    create: async (userId, memberId) => {
      if (memberId === userId) {
        throw exception.badRequest('CANNOT_CREATE_CHAT_WITH_YOURSELF');
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
        if (ws.hasConnection(member.userId)) {
          ws.send(member.userId, {
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
      const existing = await service.findMessage({ id });
      if (!existing) throw exception.notFound('MESSAGE_NOT_FOUND');

      await service.isMember(existing.userId, existing.chatId);

      return messageRepo.remove(id);
    },

    sendMessage: async (userId, chatId, text, reply_id) => {
      await service.isMember(userId, chatId);

      const user = await userRepo.findById(userId);
      if (!user) throw exception.notFound('USER_NOT_FOUND');

      const message = await messageRepo.create({ userId, chatId, text, reply_id: reply_id || null });
      await chatRepo.update(chatId, { updatedAt: new Date() });

      const members = await chatMemberRepo.getAllMembersByChatId(chatId);

      chatNotificationService
        .notifyMessageCreated({
          senderId: userId,
          senderName: user.username,
          chatId,
          messageId: message.id,
          text,
          members,
        })
        .catch((err) => console.error('notifyMessageCreated failed:', err));

      return message;
    },

    getMessagesByChatId: async (userId, chatId, { before, after, limit }) => {
      await service.isMember(userId, chatId);
      return await messageRepo.findByChatId(chatId, { before, after, limit });
    },

    searchMessagesByChatId: async (userId, chatId, text) => {
      await service.isMember(userId, chatId);
      return await messageRepo.findAllByChatId(chatId, text);
    },

    updateMessage: async (id, userId, definition) => {
      const existing = await messageRepo.findOne({ id });
      if (!existing) throw exception.notFound('MESSAGE_NOT_FOUND');
      if (existing.userId !== userId) throw exception.forbidden('NOT_YOUR_MESSAGE');

      return messageRepo.updateMessage(id, definition);
    },

    updateReactions: async (id, userId, reaction) => {
      const existing = await messageRepo.findOne({ id });
      if (!existing) throw exception.notFound('MESSAGE_NOT_FOUND');

      await service.isMember(userId, existing.chatId);

      return messageRepo.updateReactions(id, userId, reaction);
    },

    getMessageContext: async (userId, chatId, messageId, limit) => {
      await service.isMember(userId, chatId);

      return await messageRepo.getMessageContext(chatId, messageId, limit);
    },

    pinMessage: async (userId, chatId, messageId) => {
      await service.isMember(userId, chatId);

      const message = await messageRepo.findOne({ id: messageId });
      if (!message) throw exception.notFound('MESSAGE_NOT_FOUND');
      if (message.chatId !== chatId) throw exception.forbidden('CANNOT_PIN_THIS_MESSAGE');

      const isAlreadyPinned = await pinnedMessagesRepo.findOne({ message_id: messageId });
      if (isAlreadyPinned) {
        throw exception.badRequest('ALREADY_PINNED');
      }

      const pinned = await pinnedMessagesRepo.create({
        chat_id: chatId,
        message_id: messageId,
        pinned_at: new Date(),
      });

      const members = await chatMemberRepo.getAllMembersByChatId(chatId);

      for (const member of members) {
        if (ws.hasConnection(member.userId)) {
          ws.send(member.userId, {
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
      await service.isMember(userId, chatId);

      const removed = await pinnedMessagesRepo.removeByMessageId(chatId, messageId);
      const members = await chatMemberRepo.getAllMembersByChatId(chatId);

      for (const member of members) {
        if (ws.hasConnection(member.userId)) {
          ws.send(member.userId, {
            type: CHAT_ACTIONS.unpinnedMessage,
            payload: { messageId, chatId },
          });
        }
      }

      return removed;
    },

    removeChat: async (userId, chatId) => {
      await service.isMember(userId, chatId);
      const members = await chatMemberRepo.getAllMembersByChatId(chatId);

      for (const member of members) {
        if (ws.hasConnection(member.userId)) {
          ws.send(member.userId, {
            type: CHAT_ACTIONS.deleted,
            payload: chatId,
          });
        }
      }

      return chatRepo.remove(chatId);
    },
    isMember: async (userId, chatId) => {
      const isMember = await chatMemberRepo.isMember(userId, chatId);
      if (!isMember) throw exception.forbidden('NOT_A_MEMBER');
    },
  };

  return service;
};
