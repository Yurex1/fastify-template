import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import { QueryKeys } from '../lib/queries';
import useChatUIStore from '../stores/chatUI';
import type { MessageList, MessagePageParam } from '../api/chats/types';

export function useChatMessages(anchorMessageId: number | null = null) {
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const queryKey = [QueryKeys.messages, currentChatId, anchorMessageId];

  const query = useInfiniteQuery<
    MessageList,
    Error,
    InfiniteData<MessageList, MessagePageParam>,
    typeof queryKey,
    MessagePageParam
  >({
    queryKey,
    queryFn: ({ pageParam }) => {
      if (!currentChatId) {
        throw new Error('No chat selected');
      }

      if (anchorMessageId !== null && pageParam === null) {
        return chatsApi.getMessageContext(currentChatId, anchorMessageId);
      }

      return chatsApi.getMessagesByChatId(currentChatId, pageParam ?? {});
    },

    initialPageParam: null,

    getNextPageParam: (lastPage): MessagePageParam | undefined =>
      lastPage.olderCursor !== null ? { before: lastPage.olderCursor } : undefined,

    getPreviousPageParam: (firstPage): MessagePageParam | undefined =>
      firstPage.newerCursor !== null ? { after: firstPage.newerCursor } : undefined,

    enabled: !!currentChatId,
    staleTime: Infinity,
  });

  const messages = query.data?.pages.flatMap((p) => p.messages) ?? [];

  return {
    ...query,
    messages,
  };
}
