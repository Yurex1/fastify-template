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
    getNextPageParam: (lastPage: PageData) => (lastPage.messages.length < 30 ? undefined : lastPage.page + 1),
    getPreviousPageParam: (firstPage: PageData) => (firstPage.page > 1 ? firstPage.page - 1 : undefined),
    enabled: !!currentChatId,
    staleTime: Infinity,
  });

  const messages = query.data?.pages.flatMap((p) => p.messages) ?? [];

  const clearAndReset = useCallback(
    (chatId: number) => {
      queryClient.removeQueries({ queryKey: [QueryKeys.messages, chatId] });
    },
    [queryClient],
  );

  const updateMessageCache = useCallback(
    (chatId: number, WSEvent: WSEvent) => {
      queryClient.setQueriesData<InfiniteData<PageData, number>>(
        { queryKey: [QueryKeys.messages, chatId], exact: false },
        (old) => {
          if (!old) return old;

          if (WSEvent.type === 'add') {
            return {
              ...old,
              pages: old.pages.map((page, i) =>
                i === 0 ? { ...page, messages: [WSEvent.payload, ...page.messages] } : page,
              ),
            };
          }

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: (() => {
                switch (WSEvent.type) {
                  case 'update':
                    return page.messages.map((m) => (m.id === WSEvent.payload.id ? { ...m, ...WSEvent.payload } : m));
                  case 'pin':
                    return page.messages.map((m) =>
                      m.id === WSEvent.payload.messageId ? { ...m, isPinned: WSEvent.payload.isPinned } : m,
                    );
                  case 'unpin':
                    return page.messages.map((m) =>
                      m.id === WSEvent.payload.messageId ? { ...m, isPinned: false } : m,
                    );
                  case 'delete':
                    return page.messages.filter((m) => m.id !== WSEvent.payload.messageId);
                  default:
                    return page.messages;
                }
              })(),
            })),
          };
        },
      );
    },
    [queryClient],
  );
  return { ...query, messages, updateMessageCache, clearAndReset };
}
