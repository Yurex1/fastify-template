import { QueryClient, type InfiniteData } from '@tanstack/react-query';
import { QueryKeys } from '../lib/queries';
import type { WSEvent } from '../websocket/consts/payloads';
import type { MessageList, MessagePageParam } from '../api/chats/types';

interface updateMessageCacheProps {
  queryClient: QueryClient;
  anchorMessageId: number | null;
  chatId: number;
  wsEvent: WSEvent;
}

export const updateMessageCache = ({ queryClient, anchorMessageId, chatId, wsEvent }: updateMessageCacheProps) => {
  const activeKey = [QueryKeys.messages, chatId, anchorMessageId ?? null];
  return queryClient.setQueryData<InfiniteData<MessageList, MessagePageParam>>(activeKey, (old) => {
    if (!old) return old;

    if (wsEvent.type === 'add') {
      return {
        ...old,
        pages: old.pages.map((page, i) =>
          i === 0 ? { ...page, messages: [wsEvent.payload, ...page.messages] } : page,
        ),
      };
    }

    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        messages: page.messages
          .map((m) => {
            switch (wsEvent.type) {
              case 'update':
                return m.id === wsEvent.payload.id ? { ...m, ...wsEvent.payload } : m;
              case 'reaction-update':
                return m.id === wsEvent.payload.id
                  ? {
                      ...m,
                      reactions: wsEvent.payload.reactions ?? {},
                    }
                  : m;
              case 'pin':
                return m.id === wsEvent.payload.messageId ? { ...m, isPinned: true } : m;
              case 'unpin':
                return m.id === wsEvent.payload.messageId ? { ...m, isPinned: false } : m;
              case 'delete':
                return m.id === wsEvent.payload.messageId ? null : m;
              default:
                return m;
            }
          })
          .filter((m): m is NonNullable<typeof m> => m !== null),
      })),
    };
  });
};
