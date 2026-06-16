import { useRef, useEffect, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import type { VirtuosoHandle } from 'react-virtuoso';
import { useQueryClient } from '@tanstack/react-query';
import { useChatMessages } from './useChatMessages';
import useChatUIStore from '../stores/chatUI';
import { QueryKeys } from '../lib/queries';

const START_INDEX = 1_000_000;
const HIGHLIGHT_MS = 1500;
const IN_VIEW_HIGHLIGHT_DELAY_MS = 300;

export function useMessageList(virtuosoRef: React.RefObject<VirtuosoHandle | null>) {
  const queryClient = useQueryClient();
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const anchorMessageId = useChatUIStore((s) => s.anchorMessageId);
  const setAnchorMessageId = useChatUIStore((s) => s.setAnchorMessageId);
  const setIsAtBottom = useChatUIStore((s) => s.setIsAtBottom);
  const setHighlightedMessageId = useChatUIStore((s) => s.setHighlightedMessageId);

  const {
    messages,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
  } = useChatMessages(anchorMessageId);

  const data = useMemo(() => [...messages].reverse(), [messages]);
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const chatKey = `${currentChatId}-${anchorMessageId ?? ''}`;
  const chatKeyRef = useRef(chatKey);

  const firstItemIndexRef = useRef<number>(START_INDEX);
  const prevOldestIdRef = useRef<number | null>(null);

  const [firstItemState, setFirstItemState] = useState<{ key: string; value: number }>({
    key: chatKey,
    value: START_INDEX,
  });
  const firstItemIndex = firstItemState.key === chatKey ? firstItemState.value : START_INDEX;

  const [isListReady, setIsListReady] = useState<boolean>(anchorMessageId === null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightedAnchorRef = useRef<number | null>(null);

  if (chatKeyRef.current !== chatKey) {
    chatKeyRef.current = chatKey;
    firstItemIndexRef.current = START_INDEX;
    prevOldestIdRef.current = null;
  }

  useEffect(() => {
    setAnchorMessageId(null);
  }, [currentChatId, setAnchorMessageId]);

  const highlight = useCallback(
    (messageId: number, delay = 0) => {
      const run = () => {
        setHighlightedMessageId(messageId);
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => setHighlightedMessageId(null), HIGHLIGHT_MS);
      };
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      if (delay > 0) highlightTimerRef.current = setTimeout(run, delay);
      else run();
    },
    [setHighlightedMessageId],
  );

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

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
    } else if (prevOldestIdRef.current === null) {
      setFirstItemState({ key: chatKey, value: START_INDEX });
    }

    prevOldestIdRef.current = currentOldestId ?? null;
  }, [messages, chatKey]);

  useEffect(() => {
    if (anchorMessageId === null) {
      highlightedAnchorRef.current = null;

      if (!isLoading) setIsListReady(true);
      return;
    }

    const idx = data.findIndex((m) => m.id === anchorMessageId);

    if (idx === -1) {
      if (!isFetching) {
        setAnchorMessageId(null);
      } else {
        setIsListReady(false);
      }
      return;
    }

    virtuosoRef.current?.scrollToIndex({ index: idx, align: 'center', behavior: 'auto' });

    const raf = requestAnimationFrame(() => setIsListReady(true));

    if (highlightedAnchorRef.current !== anchorMessageId) {
      highlightedAnchorRef.current = anchorMessageId;
      highlight(anchorMessageId);
    }

    return () => cancelAnimationFrame(raf);
  }, [data, anchorMessageId, isFetching, isLoading, highlight, setAnchorMessageId, virtuosoRef]);

  const startReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  const endReached = () => {
    if (hasPreviousPage && !isFetchingPreviousPage && !isLoading) {
      fetchPreviousPage();
    }
  };

  const atBottomStateChange = (atBottom: boolean) => setIsAtBottom(atBottom);

  const initialTopMostItemIndex = () => {
    if (anchorMessageId === null || data.length === 0) {
      return { index: Math.max(0, data.length - 1), align: 'end' as const };
    }
    const idx = data.findIndex((m) => m.id === anchorMessageId);
    return { index: idx === -1 ? data.length - 1 : idx, align: 'center' as const };
  };

  const scrollToMessage = useCallback(
    (messageId: number) => {
      const idx = dataRef.current.findIndex((m) => m.id === messageId);

      if (idx !== -1 && virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({ index: idx, align: 'center', behavior: 'smooth' });
        highlight(messageId, IN_VIEW_HIGHLIGHT_DELAY_MS);
        return;
      }

      setIsListReady(false);
      if (anchorMessageId === messageId) {
        setAnchorMessageId(null);
        requestAnimationFrame(() => setAnchorMessageId(messageId));
      } else {
        setAnchorMessageId(messageId);
      }
    },
    [anchorMessageId, highlight, setAnchorMessageId, virtuosoRef],
  );

  const returnToLive = useCallback(() => {
    if (anchorMessageId === null) {
      virtuosoRef.current?.scrollToIndex({ index: 'LAST', behavior: 'smooth' });
      return;
    }

    queryClient.removeQueries({ queryKey: [QueryKeys.messages, currentChatId, null] });
    setIsListReady(false);
    setAnchorMessageId(null);
  }, [anchorMessageId, currentChatId, queryClient, setAnchorMessageId, virtuosoRef]);

  return {
    messages: data,
    firstItemIndex,
    initialTopMostItemIndex,
    startReached,
    endReached,
    atBottomStateChange,
    scrollToMessage,
    returnToLive,
    isListReady,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
  };
}
