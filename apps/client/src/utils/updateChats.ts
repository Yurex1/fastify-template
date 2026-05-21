import { QueryClient, type InfiniteData } from '@tanstack/react-query';
import { CHAT_TYPES } from './consts/chatTypes';
import { QueryKeys } from '../lib/queries';
import type { Chat, ChatList, ChatPageParam, Message } from '../api/chats/types';

interface updateChatsCacheProps {
  queryClient: QueryClient;
  type: string;
  chatId: number;
  data: Partial<Message> | Chat;
}

export const updateChatsCache = ({ queryClient, type, chatId, data }: updateChatsCacheProps) => {
  queryClient.setQueryData<InfiniteData<ChatList, ChatPageParam>>([QueryKeys.chats], (old) => {
    if (!old?.pages?.length) return old;

    if (type === CHAT_TYPES.update) {
      const payload = data as any;
      const newUpdatedAt = payload.createdAt || payload.updatedAt || new Date().toISOString();

      let updatedChat: Chat | null = null;

      const newPages = old.pages.map((page) => {
        const chatIndex = page.chats.findIndex((c) => c?.id === chatId);

        if (chatIndex !== -1) {
          updatedChat = {
            ...page.chats[chatIndex],
            updatedAt: newUpdatedAt,
          };

          const filteredChats = page.chats.filter((c) => c.id !== chatId);

          return {
            ...page,
            chats: filteredChats,
          };
        }
        return page;
      });

      if (updatedChat && newPages.length > 0) {
        newPages[0] = {
          ...newPages[0],
          chats: [updatedChat, ...newPages[0].chats],
        };
      }

      return {
        ...old,
        pages: newPages,
      };
    }

    return old;
  });
};
