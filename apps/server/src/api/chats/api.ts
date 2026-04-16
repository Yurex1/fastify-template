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
      handler: (user, request) => {
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

    // sendMessage: {
    //   method: 'post',
    //   access: 'access',
    //   schema: schemas.sendMessage,
    //   params: ['chatId'],
    //   handler: (user, request) => {
    //     const { chatId } = request.params;
    //     const { text } = request.body;
    //     return chatService.sendMessage(user.id, chatId, text);
    //   },
    // },
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

    // updateMessage: {
    //   method: 'put',
    //   access: 'access',
    //   params: ['id'],
    //   schema: schemas.updateMessage,
    //   handler: async (user, request) => {
    //     const { id } = request.params;
    //     const updateData = request.body;
    //     return chatService.updateMessage(id, user.id, updateData);
    //   },
    // },

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
