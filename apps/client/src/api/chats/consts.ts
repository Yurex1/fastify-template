export const ENDPOINTS = {
  CHAT_CREATE: '/chats/create',
  CHAT_GET_LIST: '/chats/list?status=approved',
  CHAT_GET_PENDING_LIST: '/chats/list?status=pending',
  CHAT_GET_MESSAGES: '/chats/getMessagesByChatId',
  CHAT_GET_MESSAGE_CONTEXT: '/chats/getMessageContext',
  CHAT_SEARCH_MESSAGES: '/chats/searchMessagesByChatId',
  CHAT_GET_PINNED_MESSAGES: '/chats/getAllPinnedMessages',
  CHAT_POST_PINNED_MESSAGE: '/chats/pinMessage',
  CHAT_DELETE_PINNED_MESSAGE: '/chats/unpinMessage',
  CHAT_DELETE: '/chats/removeChat',
  CHAT_GET_LIVEKIT_TOKEN: '/livekit/token',
  CHAT_GET_LIVEKIT_ROOM: '/livekit/room',
};
