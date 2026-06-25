import { useRef, useEffect, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import type { VirtuosoHandle } from 'react-virtuoso';
import { useQueryClient } from '@tanstack/react-query';
import { useChatMessages } from './useChatMessages';
import useChatUIStore from '../stores/chatUI';
import { QueryKeys } from '../lib/queries';
import { VIRTUOSO_CONFIG } from '../utils/consts/virtuoso';

interface MessageListRefs {
  firstItemIndex: number;
  prevOldestId: number | null;
  highlightedAnchorId: number | null;
  highlightTimer: ReturnType<typeof setTimeout> | null;
}

export function useMessageList(virtuosoRef: React.RefObject<VirtuosoHandle | null>) {
  const queryClient = useQueryClient();
  const currentChatId = useChatUIStore((s) => s.currentChatId);
  const anchorMessageId = useChatUIStore((s) => s.anchorMessageId);
  const setAnchorMessageId = useChatUIStore((s) => s.setAnchorMessageId);
  const setIsAtBottom = useChatUIStore((s) => s.setIsAtBottom);
  const setHighlightedMessageId = useChatUIStore((s) => s.setHighlightedMessageId);

  const refs = useRef<MessageListRefs>({
    firstItemIndex: VIRTUOSO_CONFIG.START_INDEX,
    prevOldestId: null,
    highlightedAnchorId: null,
    highlightTimer: null,
  });

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

  const [firstItemState, setFirstItemState] = useState<{ key: string; value: number }>({
    key: chatKey,
    value: VIRTUOSO_CONFIG.START_INDEX,
  });
  const firstItemIndex = firstItemState.key === chatKey ? firstItemState.value : VIRTUOSO_CONFIG.START_INDEX;

  const [isListReady, setIsListReady] = useState<boolean>(anchorMessageId === null);

  if (chatKeyRef.current !== chatKey) {
    chatKeyRef.current = chatKey;
    refs.current.firstItemIndex = VIRTUOSO_CONFIG.START_INDEX;
    refs.current.prevOldestId = null;
  }

  useEffect(() => {
    setAnchorMessageId(null);
  }, [currentChatId, setAnchorMessageId]);

  const clearHighlightTimer = () => {
    if (refs.current.highlightTimer) {
      clearTimeout(refs.current.highlightTimer);
    }
  };

  const highlight = useCallback(
    (messageId: number, delay = 0) => {
      clearHighlightTimer();

      const run = () => {
        setHighlightedMessageId(messageId);
        refs.current.highlightTimer = setTimeout(() => setHighlightedMessageId(null), VIRTUOSO_CONFIG.HIGHLIGHT_MS);
      };

      if (delay > 0) refs.current.highlightTimer = setTimeout(run, delay);
      else run();
    },
    [setHighlightedMessageId],
  );

  useEffect(() => {
    return () => clearHighlightTimer();
  }, []);

  useLayoutEffect(() => {
    if (messages.length === 0) return;

    const currentOldestId = messages[messages.length - 1]?.id;

    if (refs.current.prevOldestId !== null && currentOldestId !== refs.current.prevOldestId) {
      const idx = messages.findIndex((m) => m.id === refs.current.prevOldestId);
      const addedBefore = idx === -1 ? 0 : messages.length - idx - 1;

      if (addedBefore > 0) {
        refs.current.firstItemIndex -= addedBefore;
        setFirstItemState({ key: chatKey, value: refs.current.firstItemIndex });
      }
    } else if (refs.current.prevOldestId === null) {
      setFirstItemState({ key: chatKey, value: VIRTUOSO_CONFIG.START_INDEX });
    }

    refs.current.prevOldestId = currentOldestId ?? null;
  }, [messages, chatKey]);

  useEffect(() => {
    if (anchorMessageId === null) {
      refs.current.highlightedAnchorId = null;

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

    if (refs.current.highlightedAnchorId !== anchorMessageId) {
      refs.current.highlightedAnchorId = anchorMessageId;
      highlight(anchorMessageId);
    }

    return () => cancelAnimationFrame(raf);
  }, [data, anchorMessageId, isFetching, isLoading, highlight, setAnchorMessageId, virtuosoRef]);

  const startReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  const endReached = useCallback(() => {
    if (hasPreviousPage && !isFetchingPreviousPage && !isLoading) {
      fetchPreviousPage();
    }
  }, [hasPreviousPage, isFetchingPreviousPage, isLoading, fetchPreviousPage]);

  const atBottomStateChange = useCallback(
    (atBottom: boolean) => {
      setIsAtBottom(atBottom);
    },
    [setIsAtBottom],
  );

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
        highlight(messageId, VIRTUOSO_CONFIG.IN_VIEW_HIGHLIGHT_DELAY_MS);
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
