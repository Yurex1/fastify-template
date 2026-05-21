import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { PINNED_MESSAGES_ACTION } from './consts/pinned';
import { QueryKeys } from '../lib/queries';
import type { PinnedMessagesPayload, PinnedPage } from '../api/chats/types';

interface updatePinnedMessagesCacheProps {
  queryClient: QueryClient;
  currentChatId: number | null;
  action: PinnedMessagesPayload;
}
export const updatePinnedMessagesCache = ({ queryClient, currentChatId, action }: updatePinnedMessagesCacheProps) => {
  if (!currentChatId) return;

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
