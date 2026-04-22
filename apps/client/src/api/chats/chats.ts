import api from '../api';
import type { Chat, Message } from '../types';

const chatsApi = {
  createChat: async (memberId: number) => {
    const response = await api.post(`/chats/create/${memberId}`).json<Chat>();
    return response;
  },
  getChatList: async () => {
    const response = await api.get(`/chats/list?status=approved&page=1&limit=30`).json<Chat[]>();
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

  removeChat: async (chatId: number) => {
    const response = await api.delete(`/chats/removeChat/${chatId}`).json<boolean>();
    return response;
  },
};

export default chatsApi;
