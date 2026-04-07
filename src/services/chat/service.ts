import { exception } from '../../utils/exception/util';
import type { ChatService, Deps } from './types';

export const init = ({ chatRepo, chatMemberRepo, userRepo }: Deps): ChatService => ({
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

    const chat = await chatRepo.create({});
    await chatMemberRepo.addMembers(chat.id, [
      { userId, status: 'approved' },
      { userId: memberId, status: 'pending' },
    ]);
    return chat;
  },

  list: async (userId, status, page, limit) => {
    return chatMemberRepo.listChatsForUser(userId, status, page, limit);
  },

  removeChat: async (userId, chatId) => {
    const member = await chatMemberRepo.isMember(userId, chatId);
    if (!member) {
      throw exception.forbidden('Not a member of this chat');
    }
    return chatRepo.remove(chatId);
  },
});
