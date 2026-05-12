import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import type { Message, WSEvent } from '../api/types';
import { QueryKeys } from '../lib/queries';
import { useCallback } from 'react';
import useChatUIStore from '../stores/chatUI';

type PageData = { messages: Message[]; page: number };

export function useChatMessages(startPage = 1) {
  const queryClient = useQueryClient();
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const queryKey = [QueryKeys.messages, currentChatId, startPage];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const page = (pageParam as number) ?? startPage;
      const messages = await chatsApi.getMessagesByChatId(currentChatId, page);
      return { messages, page } satisfies PageData;
    },
    initialPageParam: startPage,
    getNextPageParam: (lastPage: PageData) => (lastPage.messages.length < 0 ? undefined : lastPage.page + 1),
    getPreviousPageParam: (firstPage: PageData) => (firstPage.page > 1 ? firstPage.page - 1 : undefined),
    enabled: !!currentChatId,
    staleTime: Infinity,
  });

  const messages = query.data?.pages.flatMap((p) => p.messages) ?? [];

  const clearAndReset = useCallback(
    (chatId: number) => {
      queryClient.removeQueries({ queryKey: [QueryKeys.messages, chatId], exact: false });
    },
    [queryClient],
  );

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
            switch (WSEvent.type) {
              case 'update':
                return page.map((message) =>
                  message.id === WSEvent.payload.id ? { ...message, ...WSEvent.payload } : message,
                );

              case 'pin':
                return page.map((message) =>
                  message.id === WSEvent.payload.messageId
                    ? { ...message, isPinned: WSEvent.payload.isPinned }
                    : message,
                );

              case 'unpin':
                return page.map((message) =>
                  message.id === WSEvent.payload.messageId ? { ...message, isPinned: false } : message,
                );

              case 'delete':
                return page.filter((message) => message.id !== WSEvent.payload.messageId);

              default:
                return page;
            }
          }),
        };
      });
    },
    [queryClient],
  );

  return { ...query, messages, updateMessageCache, clearAndReset };
}
