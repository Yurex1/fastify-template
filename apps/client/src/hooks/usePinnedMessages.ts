import { useInfiniteQuery, type InfiniteData, type QueryKey } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import { QueryKeys } from '../lib/queries';
import useChatUIStore from '../stores/chatUI';
import type { PinnedMessageList } from '../api/chats/types';

type PageParam = { createdAt?: string } | null;

export function usePinnedMessages() {
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const query = useInfiniteQuery<PinnedMessageList, Error, InfiniteData<PinnedMessageList>, QueryKey, PageParam>({
    queryKey: [QueryKeys.pinnedMessages, currentChatId],
    queryFn: async ({ pageParam }) => chatsApi.getAllPinnedMessages(currentChatId!, pageParam?.createdAt ?? undefined),

    enabled: currentChatId !== null,
    initialPageParam: null,

    getNextPageParam: (lastPage): PageParam | undefined => {
      return lastPage.nextCursor?.createdAt ? { createdAt: lastPage.nextCursor.createdAt } : undefined;
    },

    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  const pinnedMessages = query.data?.pages.flatMap((page) => page.data ?? []).reverse() ?? [];

  return { ...query, pinnedMessages };
}
