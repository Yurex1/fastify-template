import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import type { Chat, Message } from '../api/types';
import type { WSEvent } from '../api/types';
import { QueryKeys } from '../lib/queries';
import { useCallback } from 'react';

interface useChatMessagesProps {
  currentChatId: number | null;
}

export function useChatMessages({ currentChatId }: useChatMessagesProps) {
  const queryClient = useQueryClient();
  const queryKey = [QueryKeys.messages, currentChatId];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => chatsApi.getMessagesByChatId(currentChatId, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length < 20 ? undefined : allPages.length + 1),
    enabled: !!currentChatId,
    staleTime: Infinity,
  });

  const updateMessageCache = useCallback(
    (chatId: number, WSEvent: WSEvent) => {
      queryClient.setQueryData<InfiniteData<Message[], number>>([QueryKeys.messages, chatId], (old) => {
        if (!old) return old;

        if (WSEvent.type === 'add') {
          return {
            ...old,
            pages: old.pages.map((page, index) => (index === 0 ? [WSEvent.payload, ...page] : page)),
          };
        }

        return {
          ...old,
          pages: old.pages.map((page) => {
            if (WSEvent.type === 'update') {
              return page.map((message) =>
                message.id === WSEvent.payload.id ? { ...message, ...WSEvent.payload } : message,
              );
            }
            if (WSEvent.type === 'delete') {
              return page.filter((message) => message.id !== WSEvent.payload.messageId);
            }

            return page;
          }),
        };
      });
    },
    [queryClient],
  );

  const updateChatsCache = (type: string, chatId: number, newDate: string) => {
    queryClient.setQueryData<InfiniteData<Chat[]>>([QueryKeys.chats], (old) => {
      if (!old) return old;
      if (type === 'update') {
        let targetChat: Chat | null = null;

        const updatedPages = old.pages.map((page) => {
          const found = page.find((c) => c.id === chatId);
          if (found) {
            targetChat = { ...found, updatedAt: newDate };
            return page.filter((c) => c.id !== chatId);
          }
          return page;
        });

        if (targetChat) {
          const newPages = [...updatedPages];
          newPages[0] = [targetChat, ...newPages[0]];

          return {
            ...old,
            pages: newPages,
          };
        }

        return old;
      }

      // if (type === 'create') {
      //   return {
      //     ...old,
      //     pages: old.pages.map((page, index) => (index === 0 ? [WSEvent.payload, ...page] : page)),
      //   };
      // }
    });
  };

  return { ...query, updateMessageCache, updateChatsCache };
}
