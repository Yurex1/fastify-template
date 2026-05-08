import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import { QueryKeys } from '../lib/queries';
import type { PinnedMessage } from '../api/types';

interface usePinnedMessagesProps {
  currentChatId: number;
}

interface usePinnedMessagesProps {
  currentChatId: number;
}

export function usePinnedMessages({ currentChatId }: usePinnedMessagesProps) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: [QueryKeys.pinnedMessages, currentChatId],
    queryFn: ({ pageParam = 1 }) => chatsApi.getAllPinnedMessages(currentChatId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length < 20 ? undefined : allPages.length + 1),
    staleTime: Infinity,
    enabled: !!currentChatId,
  });

  const updatePinnedMessagesCache = (_action: 'pin' | 'unpin', _data: PinnedMessage) => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.pinnedMessages, currentChatId],
    });
  };
  return { ...query, updatePinnedMessagesCache };
}
