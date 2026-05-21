import { useRef, useEffect, useState, useLayoutEffect } from 'react';
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

  const firstItemIndexRef = useRef<number>(START_INDEX);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);
  const prevOldestIdRef = useRef<number | null>(null);

  useEffect(() => {
    firstItemIndexRef.current = START_INDEX;
    setFirstItemIndex(START_INDEX);
    prevOldestIdRef.current = null;
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
        setFirstItemIndex(firstItemIndexRef.current);
      }
    }

    prevOldestIdRef.current = currentOldestId ?? null;
  }, [messages]);

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
    if (anchorMessageId === null || messages.length === 0) return messages.length - 1;
    const idx = messages.findIndex((m) => m.id === anchorMessageId);
    return idx === -1 ? messages.length - 1 : messages.length - 1 - idx;
  };

  const scrollToMessage = (messageId: number) => {
    const idx = messages.findIndex((m) => m.id === messageId);

    if (idx !== -1) {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1 - idx,
        align: 'center',
        behavior: 'smooth',
      });
    } else if (anchorMessageId === null) {
      setAnchorMessageId(messageId);
    }
  };

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
