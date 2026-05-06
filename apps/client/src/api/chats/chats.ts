import api from '../api';
import type { Chat, Message, PinnedMessage } from '../types';

const chatsApi = {
  createChat: async (memberId: number) => {
    const response = await api.post(`/chats/create/${memberId}`).json<Chat>();
    return response;
  },
  getChatList: async (page: number = 1, limit: number = 30) => {
    const response = await api.get(`/chats/list?status=approved&page=${page}&limit=${limit}`).json<Chat[]>();
    return response;
  },
  getPendingChatList: async () => {
    const response = await api.get(`/chats/list?status=pending&page=1&limit=30`).json<Chat[]>();
    return response;
  },

  getMessagesByChatId: async (chatId: number, page: number = 1, limit: number = 30) => {
    const response = await api
      .get(`/chats/getMessagesByChatId/${chatId}?page=${page}&limit=${limit}`)
      .json<Message[]>();
    return response;
  },

  getAllPinnedMessages: async (chatId: number, page: number = 1, limit: number = 30) => {
    const response = await api
      .get(`/chats/getAllPinnedMessages/${chatId}?page=${page}&limit=${limit}`)
      .json<PinnedMessage[]>();
    return response;
  },

  pinMessage: async (chatId: number, messageId: number) => {
    const response = await api.post(`/chats/pinMessage`, { json: { chatId, messageId } }).json<PinnedMessage[]>();
    return response;
  },

  unpinMessage: async (chatId: number, messageId: number) => {
    const response = await api.delete(`/chats/unpinMessage`, { json: { chatId, messageId } }).json();

    return response;
  },

  removeChat: async (chatId: number) => {
    const response = await api.delete(`/chats/removeChat/${chatId}`).json<boolean>();
    return response;
  },
};

export default chatsApi;
