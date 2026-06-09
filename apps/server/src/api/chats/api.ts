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
        const { lang } = request;
        return chatService.create(user.id, memberId, lang);
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
        const { lang } = request;
        return chatService.getMessagesByChatId(user.id, chatId, { after, before, limit }, lang);
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
        const { lang } = request;

        return chatService.searchMessagesByChatId(user.id, chatId, text, lang);
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
        const { lang } = request;

        return chatService.getMessageContext(user.id, chatId, messageId, limit, lang);
      },
    },

    pinMessage: {
      method: 'post',
      access: 'access',
      schema: schemas.pinMessage,

      handler: async (user, request) => {
        const { chatId, messageId } = request.body;
        const { lang } = request;

        return chatService.pinMessage(user.id, chatId, messageId, lang);
      },
    },

    unpinMessage: {
      method: 'delete',
      access: 'access',
      schema: schemas.unpinMessage,

      handler: async (user, request) => {
        const { chatId, messageId } = request.body;
        const { lang } = request;

        return chatService.unpinMessage(user.id, chatId, messageId, lang);
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
        const { lang } = request;

        return chatService.getAllPinnedMessages(chatId, { createdAt, id: user.id }, limit, lang);
      },
    },

    removeChat: {
      method: 'delete',
      access: 'access',
      schema: schemas.removeChat,
      params: ['chatId'],
      handler: (user, request) => {
        const { chatId } = request.params;
        const { lang } = request;

        return chatService.removeChat(user.id, chatId, lang);
      },
    },
  };
};
