import type { QueryClient } from '@tanstack/react-query';
import { CACHE_OP } from '../consts/chatEvents';
import { updateChatsCache } from '../../utils/updateChats';
import type { WsFrame } from '../consts/payloads';
import type { Chat } from '../../api/chats/types';

export function handleChatCreated(data: WsFrame<Chat>, queryClient: QueryClient) {
  updateChatsCache({ queryClient, type: CACHE_OP.CHAT_CREATE, chatId: data.payload.id, data: data.payload });
}
