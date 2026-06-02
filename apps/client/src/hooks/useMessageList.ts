import { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import type { VirtuosoHandle } from 'react-virtuoso';
import { useChatMessages } from './useChatMessages';
import useChatUIStore from '../stores/chatUI';

const START_INDEX = 1_000_000;

export function useMessageList(virtuosoRef: React.RefObject<VirtuosoHandle | null>) {
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const anchorMessageId = useChatUIStore((s) => s.anchorMessageId);
  const setAnchorMessageId = useChatUIStore((s) => s.setAnchorMessageId);
  const setIsAtBottom = useChatUIStore((s) => s.setIsAtBottom);

  const {
    messages,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
  } = useChatMessages(anchorMessageId);

  const chatKey = `${currentChatId}-${anchorMessageId ?? ''}`;

  const firstItemIndexRef = useRef<number>(START_INDEX);
  const prevOldestIdRef = useRef<number | null>(null);

  const [firstItemState, setFirstItemState] = useState<{ key: string; value: number }>({
    key: chatKey,
    value: START_INDEX,
  });
  const firstItemIndex = firstItemState.key === chatKey ? firstItemState.value : START_INDEX;

  useEffect(() => {
    firstItemIndexRef.current = START_INDEX;
    prevOldestIdRef.current = null;
    setFirstItemState({ key: chatKey, value: START_INDEX });
  }, [currentChatId, anchorMessageId]);

  useEffect(() => {
    setAnchorMessageId(null);
  }, [currentChatId]);

  useLayoutEffect(() => {
    if (messages.length === 0) return;

    const currentOldestId = messages[messages.length - 1]?.id;

    if (prevOldestIdRef.current !== null && currentOldestId !== prevOldestIdRef.current) {
      const idx = messages.findIndex((m) => m.id === prevOldestIdRef.current);
      const addedBefore = idx === -1 ? 0 : messages.length - idx - 1;

      if (addedBefore > 0) {
        firstItemIndexRef.current -= addedBefore;
        setFirstItemState({ key: chatKey, value: firstItemIndexRef.current });
      }
    }

    prevOldestIdRef.current = currentOldestId ?? null;
  }, [messages, chatKey]);

  const startReached = () => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  };

  const endReached = () => {
    if (hasPreviousPage && !isFetchingPreviousPage && !isLoading) {
      fetchPreviousPage();
    }
  };

  const atBottomStateChange = (atBottom: boolean) => setIsAtBottom(atBottom);

  const initialTopMostItemIndex = () => {
    if (anchorMessageId === null || messages.length === 0) {
      return { index: Math.max(0, messages.length - 1), align: 'end' as const };
    }
    const idx = messages.findIndex((m) => m.id === anchorMessageId);
    const index = idx === -1 ? messages.length - 1 : messages.length - 1 - idx;
    return { index, align: 'center' as const };
  };

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToMessage = useCallback(
    (messageId: number) => {
      const current = messagesRef.current;
      const idx = current.findIndex((m) => m.id === messageId);

      if (idx !== -1) {
        virtuosoRef.current?.scrollToIndex({
          index: current.length - 1 - idx,
          align: 'center',
          behavior: 'smooth',
        });
        return;
      }

      setAnchorMessageId(null);
      requestAnimationFrame(() => {
        setAnchorMessageId(messageId);
      });
    },
    [setAnchorMessageId],
  );

  const reversed = [...messages].reverse();

  return {
    messages: reversed,
    firstItemIndex,
    initialTopMostItemIndex,
    startReached,
    endReached,
    atBottomStateChange,
    scrollToMessage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
  };
}
