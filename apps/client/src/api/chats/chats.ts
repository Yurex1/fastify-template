import api from '../api';
import type { Chat, LastPinnedMessageStats, Message, PinnedMessage } from '../types';
import { ENDPOINTS } from './consts';

const chatsApi = {
  createChat: async (memberId: number) => {
    const response = await api.post(`${ENDPOINTS.CHAT_CREATE}/${memberId}`).json<Chat>();
    return response;
  },
  getChatList: async (page: number = 1, limit: number = 30) => {
    const response = await api.get(`${ENDPOINTS.CHAT_GET_LIST}&page=${page}&limit=${limit}`).json<Chat[]>();
    return response;
  },
  getPendingChatList: async () => {
    const response = await api.get(`${ENDPOINTS.CHAT_GET_PENDING_LIST}&page=1&limit=30`).json<Chat[]>();
    return response;
  },

  getMessagesByChatId: async (chatId: number, page: number = 1, limit: number = 30) => {
    const response = await api
      .get(`${ENDPOINTS.CHAT_GET_MESSAGES}/${chatId}?page=${page}&limit=${limit}`)
      .json<Message[]>();
    return response;
  },

  getMessagePage: async (chatId: number, messageId: number, limit: number = 30) => {
    const response = await api
      .get(`${ENDPOINTS.CHAT_GET_MESSAGE_PAGE}/${chatId}/${messageId}?limit=${limit}`)
      .json<{ page: number }>();
    return response;
  },

  getPinnedStats: async (chatId: number) => {
    const response = await api.get(`${ENDPOINTS.CHAT_GET_PINNED_STATS}/${chatId}`).json<LastPinnedMessageStats>();
    return response;
  },

  searchMessagesByChatId: async (chatId: number, text: string) => {
    const response = await api.get(`${ENDPOINTS.CHAT_SEARCH_MESSAGES}/${chatId}?text=${text}`).json<Message[]>();
    return response;
  },

  getAllPinnedMessages: async (chatId: number, page: number = 1, limit: number = 30) => {
    const response = await api
      .get(`${ENDPOINTS.CHAT_GET_PINNED_MESSAGES}/${chatId}?page=${page}&limit=${limit}`)
      .json<PinnedMessage[]>();
    return response;
  },

  pinMessage: async (chatId: number, messageId: number) => {
    const response = await api
      .post(`${ENDPOINTS.CHAT_POST_PINNED_MESSAGE}`, { json: { chatId, messageId } })
      .json<PinnedMessage>();
    return response;
  },

  unpinMessage: async (chatId: number, messageId: number) => {
    const response = await api
      .delete(`${ENDPOINTS.CHAT_DELETE_PINNED_MESSAGE}`, { json: { chatId, messageId } })
      .json();

    return response;
  },

  removeChat: async (chatId: number) => {
    const response = await api.delete(`${ENDPOINTS.CHAT_DELETE}/${chatId}`).json<boolean>();
    return response;
  },
};

export default chatsApi;
