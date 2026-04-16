import api from "../api";

const chatsApi = {
  createChat: async (memberId: number) => {
    const response = await api.post(`/chats/create/${memberId}`).json();
    return response;
  },
  getChatList: async () => {
    const response = await api
      .get(`/chats/list?status=approved&page=1&limit=5`)
      .json();
    return response;
  },

  // getMessageByChatId: async (chatId: number) => {
  //   const response = await api
  //     .get(`/chats/getMessagesByChatId/${chatId}?page=1&limit=100`)
  //     .json();
  //   return response;
  // },
  getMessageByChatId: async (
    chatId: number,
    page: number = 1,
    limit: number = 30,
  ) => {
    const response = await api
      .get(`/chats/getMessagesByChatId/${chatId}?page=${page}&limit=${limit}`)
      .json();
    return response;
  },

  removeChat: async (chatId: number) => {
    const response = await api.delete(`/chats/removeChat/${chatId}`).json();
    return response;
  },
};

export default chatsApi;
