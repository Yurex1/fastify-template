import { ChatApi, Deps } from './types';
import * as schemas from './schemas';
import { ChatMemberStatus } from '../../data/chatMember/types';

export const init = ({ chatService }: Deps): ChatApi => {
  return {
    create: {
      method: 'post',
      access: 'access',
      schema: schemas.create,
      params: ['memberId'],

      handler: (user, request, _reply) => {
        const { memberId } = request.params;
        return chatService.create(user.id, memberId);
      },
    },

    list: {
      method: 'get',
      access: 'access',
      schema: schemas.list,
      handler: (user, request) => {
        const { status, page, limit } = request.query;

        return chatService.list(user.id, status as ChatMemberStatus, page, limit);
      },
    },

    getMessagesByChatId: {
      method: 'get',
      access: 'access',
      schema: schemas.getMessagesByChatId,
      params: ['chatId'],
      handler: (user, request) => {
        const { chatId } = request.params;
        const { page, limit } = request.query;
        return chatService.getMessagesByChatId(user.id, chatId, page, limit);
      },
    },

    removeChat: {
      method: 'delete',
      access: 'access',
      schema: schemas.removeChat,
      params: ['chatId'],
      handler: (user, request) => {
        const { chatId } = request.params;

        return chatService.removeChat(user.id, chatId);
      },
    },
  };
};
