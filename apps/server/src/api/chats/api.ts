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
        const { status, updatedAt, limit } = request.query;
        const cursor = updatedAt ? { updatedAt: updatedAt, id: user.id } : null;

        return chatService.list(user.id, status as ChatMemberStatus, cursor, limit);
      },
    },

    getMessagesByChatId: {
      method: 'get',
      access: 'access',
      schema: schemas.getMessagesByChatId,
      params: ['chatId'],
      handler: (user, request) => {
        const { chatId } = request.params;
        const { after, before, limit } = request.query;
        return chatService.getMessagesByChatId(user.id, chatId, { after, before, limit });
      },
    },

    searchMessagesByChatId: {
      method: 'get',
      access: 'access',
      schema: schemas.searchMessagesByChatId,
      params: ['chatId'],
      handler: (user, request) => {
        const { chatId } = request.params;
        const { text } = request.query;
        return chatService.searchMessagesByChatId(user.id, chatId, text);
      },
    },

    getMessageContext: {
      method: 'get',
      access: 'access',
      schema: schemas.getMessagePage,
      params: ['chatId', 'messageId'],
      handler: (user, request) => {
        const { chatId, messageId } = request.params;
        const { limit } = request.query;
        return chatService.getMessageContext(user.id, chatId, messageId, limit);
      },
    },

    pinMessage: {
      method: 'post',
      access: 'access',
      schema: schemas.pinMessage,

      handler: async (user, request) => {
        const { chatId, messageId } = request.body;
        return chatService.pinMessage(user.id, chatId, messageId);
      },
    },

    unpinMessage: {
      method: 'delete',
      access: 'access',
      schema: schemas.unpinMessage,

      handler: async (user, request) => {
        const { chatId, messageId } = request.body;
        return chatService.unpinMessage(user.id, chatId, messageId);
      },
    },

    getAllPinnedMessages: {
      method: 'get',
      access: 'access',
      schema: schemas.getAllPinnedMessages,
      params: ['chatId'],
      handler: (user, request) => {
        const { chatId } = request.params;
        const { createdAt, limit } = request.query;

        return chatService.getAllPinnedMessages(chatId, { createdAt, id: user.id }, limit);
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
