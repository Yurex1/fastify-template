import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import { QueryKeys } from '../lib/queries';
import type { Chat, Message, Payload } from '../api/types';
import { CHAT_TYPES } from '../utils/consts/chatTypes';

export function useChats() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: [QueryKeys.chats],
    queryFn: ({ pageParam = 1 }) => chatsApi.getChatList(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length < 20 ? undefined : allPages.length + 1),
    staleTime: Infinity,
  });

  const updateChatsCache = (type: string, chatId: number, data: Payload) => {
    queryClient.setQueryData<InfiniteData<Chat[], number>>([QueryKeys.chats], (old) => {
      if (!old) return old;

      if (type === CHAT_TYPES.update) {
        let targetChat: Chat | null = null;
        const payload = data as Message;

        const updatedPages = old.pages.map((page) => {
          const found = page.find((c) => c.id === chatId);
          if (found) {
            targetChat = { ...found, updatedAt: payload.createdAt };
            return page.filter((c) => c.id !== chatId);
          }
          return page;
        });

        if (targetChat) {
          const newPages = [...updatedPages];
          newPages[0] = [targetChat, ...newPages[0]];
          return { ...old, pages: newPages };
        }
        return old;
      }

      return old;
    });
  };

  return { ...query, updateChatsCache };
}
