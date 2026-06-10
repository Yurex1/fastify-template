import api from '../api';

import { ENDPOINTS } from './consts';
import type { Chat, ChatList, Message, MessageList, PinnedMessage, PinnedMessageList } from './types';

type CallTokenResponse = {
  token: string;
};

const chatsApi = {
  createChat: async (memberId: number) => {
    const response = await api.post(`${ENDPOINTS.CHAT_CREATE}/${memberId}`).json<Chat>();
    return response;
  },

  getChatList: async (updatedAt?: string, limit: number = 50) => {
    const params = new URLSearchParams();
    if (updatedAt) {
      params.append('updatedAt', updatedAt);
    }
    params.append('limit', limit.toString());

    const response = await api.get(`${ENDPOINTS.CHAT_GET_LIST}&${params.toString()}`).json<ChatList>();
    return response;
  },
  getPendingChatList: async () => {
    const response = await api.get(`${ENDPOINTS.CHAT_GET_PENDING_LIST}&page=1&limit=30`).json<ChatList>();
    return response;
  },

  getMessagesByChatId: async (chatId: number, params: { before?: number; after?: number } = {}, limit: number = 50) => {
    const urlParams = new URLSearchParams();

    if (params.before !== undefined) urlParams.append('before', params.before.toString());
    if (params.after !== undefined) urlParams.append('after', params.after.toString());

    urlParams.append('limit', limit.toString());

    const response = await api
      .get(`${ENDPOINTS.CHAT_GET_MESSAGES}/${chatId}?${urlParams.toString()}`)
      .json<MessageList>();

    return response;
  },

  getMessageContext: async (chatId: number, messageId: number, limit: number = 50) => {
    const response = await api
      .get(`${ENDPOINTS.CHAT_GET_MESSAGE_CONTEXT}/${chatId}/${messageId}?limit=${limit}`)
      .json<MessageList>();
    return response;
  },

  searchMessagesByChatId: async (chatId: number, text: string) => {
    const response = await api.get(`${ENDPOINTS.CHAT_SEARCH_MESSAGES}/${chatId}?text=${text}`).json<Message[]>();
    return response;
  },

  getAllPinnedMessages: async (chatId: number, createdAt?: string, limit: number = 100) => {
    const params = new URLSearchParams();
    if (createdAt) {
      params.append('createdAt', createdAt);
    }

    params.append('limit', limit.toString());

    const response = await api
      .get(`${ENDPOINTS.CHAT_GET_PINNED_MESSAGES}/${chatId}?${params.toString()}`)
      .json<PinnedMessageList>();
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

  getTokenCall: async (roomName: string) => {
    const response = await api
      .post(`${ENDPOINTS.CHAT_GET_LIVEKIT_TOKEN}`, { json: { roomName } })
      .json<CallTokenResponse>();
    return response;
  },

  getRoom: async (roomName: string) => {
    const response = await api.post(`${ENDPOINTS.CHAT_GET_LIVEKIT_ROOM}`, { json: { roomName } }).json();
    return response;
  },
};

export default chatsApi;
