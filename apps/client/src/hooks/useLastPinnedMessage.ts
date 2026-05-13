import { useQuery, useQueryClient } from '@tanstack/react-query';
import chatsApi from '../api/chats/chats';
import { QueryKeys } from '../lib/queries';
import type { PinnedMessage } from '../api/types';
import useChatUIStore from '../stores/chatUI';

export function useLastPinnedMessage() {
  const queryClient = useQueryClient();
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const query = useQuery({
    queryKey: [QueryKeys.pinnedStats, currentChatId],
    queryFn: () => chatsApi.getPinnedStats(currentChatId),
  });

  const updateLastPinnedMessageCache = (_action: 'pin' | 'unpin' | 'edit', _data: PinnedMessage) => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.pinnedStats, currentChatId],
    });
  };
  return { ...query, updateLastPinnedMessageCache };
}
