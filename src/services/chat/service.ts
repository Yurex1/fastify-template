import { exception } from '../../utils/exception/util';
import type { ChatService, Deps } from './types';

export const init = ({ chatRepo, chatMemberRepo, userRepo, messageRepo }: Deps): ChatService => ({
  create: async (userId, memberId) => {
    if (memberId === userId) {
      throw exception.badRequest('Cannot create chat with yourself');
    }
    const memberExists = await userRepo.existsById(memberId);
    if (!memberExists) {
      throw exception.notFound('USER_NOT_FOUND');
    }

    const existing = await chatMemberRepo.findApprovedDirectChat(userId, memberId);
    if (existing) {
      return existing;
    }

    const chat = await chatRepo.create({ title: 'iio' });
    await chatMemberRepo.addMembers(chat.id, [
      { userId, status: 'approved' },
      { userId: memberId, status: 'pending' },
    ]);
    return chat;
  },

  list: async (userId, status, page, limit) => {
    return chatMemberRepo.listChatsForUser(userId, status, page, limit);
  },

  sendMessage: async (userId, chatId, text) => {
    const member = await chatMemberRepo.isMember(userId, chatId);

    if (!member) {
      throw exception.forbidden('You are not a member of this chat');
    }

    return messageRepo.create({ userId, chatId, text });
  },

  getMessagesByChatId: async (userId, chatId) => {
    return messageRepo.findByUserIdAndChatId(userId, chatId);
  },

  updateMessage: async (id, userId, definition) => {
    const existingMessage = await messageRepo.findOne({ id });
    if (!existingMessage) throw exception.notFound('MESSAGE_NOT_FOUND');
    return messageRepo.updateMessage(id, userId, definition);
  },

  removeChat: async (userId, chatId) => {
    const member = await chatMemberRepo.isMember(userId, chatId);
    if (!member) {
      throw exception.forbidden('Not a member of this chat');
    }
    return chatRepo.remove(chatId);
  },
});
