import { useInfiniteQuery, type InfiniteData, type QueryKey } from '@tanstack/react-query';

import chatsApi from '../api/chats/chats';
import { QueryKeys } from '../lib/queries';
import type { ChatList, ChatPageParam } from '../api/chats/types';

export function useChats() {
  const query = useInfiniteQuery<ChatList, Error, InfiniteData<ChatList>, QueryKey, ChatPageParam>({
    queryKey: [QueryKeys.chats],

    queryFn: async ({ pageParam }) => {
      return await chatsApi.getChatList(pageParam?.updatedAt ?? undefined);
    },

    initialPageParam: null,

    getNextPageParam: (lastPage): ChatPageParam | undefined => {
      return lastPage.nextCursor?.updatedAt ? { updatedAt: lastPage.nextCursor.updatedAt } : undefined;
    },

    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  const chats = query.data?.pages.flatMap((page) => page.chats ?? []) ?? [];

  return {
    ...query,
    chats,
  };
}
