import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import { QueryKeys } from '../lib/queries';
import type { PinnedMessage, Message, DeletePayload } from '../api/types';
import useChatUIStore from '../stores/chatUI';

type PinnedPage = { data: PinnedMessage[]; totalCount: number };

export function usePinnedMessages() {
  const queryClient = useQueryClient();
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const query = useInfiniteQuery({
    queryKey: [QueryKeys.pinnedMessages, currentChatId],
    queryFn: ({ pageParam = 1 }) => chatsApi.getAllPinnedMessages(currentChatId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.data?.length) return undefined;
      const loadedCount = allPages.reduce((sum, page) => sum + (page?.data?.length ?? 0), 0);
      return loadedCount < lastPage.totalCount ? allPages.length + 1 : undefined;
    },
    staleTime: Infinity,
    enabled: !!currentChatId,
  });

  const updatePinnedMessagesCache = (type: 'pin' | 'unpin' | 'edit', data: any) => {
    if (type === 'pin') {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.pinnedMessages, currentChatId],
      });
      return;
    }

    queryClient.setQueryData<InfiniteData<PinnedPage>>([QueryKeys.pinnedMessages, currentChatId], (old) => {
      if (!old) return old;

      switch (type) {
        case 'unpin': {
          const { messageId } = data as DeletePayload;
          return {
            ...old,
            pages: old.pages.map((page) => {
              const filtered = page.data.filter((p) => p.message.id !== messageId);
              const removed = page.data.length - filtered.length;
              return {
                ...page,
                data: filtered,
                totalCount: page.totalCount - removed,
              };
            }),
          };
        }

        case 'edit': {
          const updated = data as Partial<Message> & { id: number };

          if (!updated.id) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((p) =>
                p.message?.id === updated.id ? { ...p, message: { ...p.message, ...updated } } : p,
              ),
            })),
          };
        }

        default:
          return old;
      }
    });
  };

  return { ...query, updatePinnedMessagesCache };
}
