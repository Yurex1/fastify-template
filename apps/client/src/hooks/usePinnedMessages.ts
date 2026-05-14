import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import { QueryKeys } from '../lib/queries';
import useChatUIStore from '../stores/chatUI';
import { PINNED_MESSAGES_ACTION } from '../utils/consts/pinned';
import type { PinnedMessagesPayload, PinnedPage } from '../api/types';

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

  const updatePinnedMessagesCache = (action: PinnedMessagesPayload) => {
    if (action.type === PINNED_MESSAGES_ACTION.PIN) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.pinnedMessages, currentChatId],
      });
      return;
    }

    queryClient.setQueryData<InfiniteData<PinnedPage>>([QueryKeys.pinnedMessages, currentChatId], (old) => {
      if (!old) return old;

      switch (action.type) {
        case PINNED_MESSAGES_ACTION.UNPIN: {
          const { messageId } = action.data;
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

        case PINNED_MESSAGES_ACTION.EDIT: {
          const updated = action.data;

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
