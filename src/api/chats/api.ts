import { ChatApi, Deps } from './types';
import * as schemas from './schemas';

export const init = ({ chatService }: Deps): ChatApi => ({
  create: {
    method: 'post',
    access: 'common',
    schema: schemas.create,
    params: ['memberId'],
    handler: (user, request) => {
      const { memberId } = request.params;

      return chatService.create(user.id, memberId);
    },
  },

  list: {
    method: 'get',
    access: 'common',
    schema: schemas.list,
    handler: (user, request) => {
      const { status, page, limit } = request.query;

      return chatService.list(user.id, status ?? 'approved', page, limit);
    },
  },

  removeChat: {
    method: 'delete',
    access: 'common',
    schema: schemas.removeChat,
    params: ['chatId'],
    handler: (user, request) => {
      const { chatId } = request.params;

      return chatService.removeChat(user.id, chatId);
    },
  },
});
