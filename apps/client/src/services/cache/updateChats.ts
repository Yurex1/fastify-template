import { QueryClient, type InfiniteData } from '@tanstack/react-query';
import { CHAT_TYPES } from '../../utils/consts/chatTypes';
import { QueryKeys } from '../../lib/queries';
import type { Chat, ChatList, ChatPageParam, Message } from '../../api/chats/types';

interface updateChatsCacheProps {
  queryClient: QueryClient;
  type: string;
  chatId: number;
  data: Partial<Message> | Chat;
}

export const updateChatsCache = ({ queryClient, type, chatId, data }: updateChatsCacheProps) => {
  queryClient.setQueryData<InfiniteData<ChatList, ChatPageParam>>([QueryKeys.chats], (old) => {
    if (!old) return undefined;

    const newPages = [...old.pages];

    if (type === CHAT_TYPES.created) {
      const payload = data as Chat;

      newPages[0] = {
        ...newPages[0],
        chats: [payload, ...newPages[0].chats],
      };
    }
    if (type === CHAT_TYPES.update) {
      const payload = data as any;
      const newUpdatedAt = payload.createdAt || payload.updatedAt || new Date().toISOString();
      let updatedChat: Chat | null = null;

      newPages.forEach((page, pageIndex) => {
        const chatIndex = page.chats.findIndex((c) => c?.id === chatId);
        if (chatIndex !== -1) {
          updatedChat = { ...page.chats[chatIndex], updatedAt: newUpdatedAt };
          newPages[pageIndex] = {
            ...page,
            chats: page.chats.filter((c) => c.id !== chatId),
          };
        }
      });

      if (updatedChat) {
        newPages[0] = {
          ...newPages[0],
          chats: [updatedChat, ...newPages[0].chats],
        };
      }
    }

    if (type === CHAT_TYPES.delete) {
      const payload = data as number;

      newPages.forEach((page, pageIndex) => {
        newPages[pageIndex] = {
          ...page,
          chats: page.chats.filter((c) => c.id !== payload),
        };
      });
    }

    return {
      ...old,
      pages: newPages,
    };
  });
};
