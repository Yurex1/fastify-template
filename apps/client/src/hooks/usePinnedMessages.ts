import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import { QueryKeys } from '../lib/queries';
import type { PinnedMessage } from '../api/types';

interface usePinnedMessagesProps {
  currentChatId: number;
}

export function usePinnedMessages({ currentChatId }: usePinnedMessagesProps) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: [QueryKeys.pinnedMessages, currentChatId],
    queryFn: ({ pageParam = 1 }) => chatsApi.getAllPinnedMessages(currentChatId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length < 30 ? undefined : allPages.length + 1),
    staleTime: Infinity,
  });

  const updatePinnedMessagesCache = (type: 'pin' | 'unpin', data: PinnedMessage) => {
    //implement optimictic update

    // queryClient.setQueryData<InfiniteData<PinnedMessage[]>>([QueryKeys.pinnedMessages, currentChatId], (old) => {
    //   if (!old) return old;

    //   if (type === 'pin') {
    //   }

    //   if (type === 'unpin') {
    //   }

    //   return old;
    // });

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.pinnedMessages, currentChatId],
    });
  };

  return { ...query, updatePinnedMessagesCache };
}
