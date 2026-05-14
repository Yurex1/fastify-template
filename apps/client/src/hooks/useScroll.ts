import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import useChatUIStore from '../stores/chatUI';
import { useIntersectionObserver } from './useIntersectionObserver';
import chatsApi from '../api/chats/chats';
import type { Message, PageData } from '../api/types';
import type {
  FetchNextPageOptions,
  FetchPreviousPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import { SCROLL_CONFIG } from '../utils/consts/scroll';
import { highlightMessage } from '../utils/hightlight';

interface useScrollProps {
  fetchNextPage: (
    options?: FetchNextPageOptions,
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<PageData, unknown>, Error>>;
  fetchPreviousPage: (
    options?: FetchPreviousPageOptions,
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<PageData, unknown>, Error>>;
  isFetchingPreviousPage: boolean;
  isFetchingNextPage: boolean;
  messages: Message[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  clearAndReset: (chatId: number) => void;
  isLoading: boolean;
  data: InfiniteData<PageData, unknown>;
  startPage: number;
  setStartPage: React.Dispatch<React.SetStateAction<number>>;
}

export function useScroll({
  fetchNextPage,
  fetchPreviousPage,
  isFetchingPreviousPage,
  isFetchingNextPage,
  messages,
  hasNextPage,
  hasPreviousPage,
  clearAndReset,
  isLoading,
  data,
  startPage,
  setStartPage,
}: useScrollProps) {
  const currentChatId = useChatUIStore((s) => s.currentChatId);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<{ id: number; offsetFromTop: number } | null>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [pendingScrollId, setPendingScrollId] = useState<number | null>(null);
  const [isJumping, setIsJumping] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting);
      },
      { threshold: SCROLL_CONFIG.INTERSECTION_THRESHOLD },
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setStartPage(1);
    setPendingScrollId(null);
    setIsJumping(false);
  }, [currentChatId]);

  const captureAnchor = useCallback(() => {
    const c = scrollContainerRef.current;
    if (!c) return;
    const containerRect = c.getBoundingClientRect();
    const messageEls = c.querySelectorAll<HTMLElement>('[id^="message-"]');
    for (const el of Array.from(messageEls)) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > containerRect.top && rect.top < containerRect.bottom) {
        const id = Number(el.id.replace('message-', ''));
        if (!Number.isNaN(id)) {
          scrollAnchorRef.current = { id, offsetFromTop: rect.top - containerRect.top };
          return;
        }
      }
    }
  }, []);

  const fetchNextPageWithPreserve = useCallback(() => {
    captureAnchor();
    return fetchNextPage();
  }, [fetchNextPage, captureAnchor]);

  const fetchPreviousPageWithPreserve = useCallback(() => {
    captureAnchor();
    return fetchPreviousPage();
  }, [fetchPreviousPage, captureAnchor]);

  useLayoutEffect(() => {
    if (!scrollAnchorRef.current) return;
    if (isFetchingPreviousPage || isFetchingNextPage) return;

    const c = scrollContainerRef.current;
    if (!c) return;

    const anchorEl = document.getElementById(`message-${scrollAnchorRef.current.id}`);
    if (anchorEl) {
      const containerRect = c.getBoundingClientRect();
      const currentOffset = anchorEl.getBoundingClientRect().top - containerRect.top;
      const diff = currentOffset - scrollAnchorRef.current.offsetFromTop;
      c.scrollTop += diff;
    }

    scrollAnchorRef.current = null;
  }, [messages.length, isFetchingPreviousPage, isFetchingNextPage]);

  const { sentinelRef: topSentinelRef } = useIntersectionObserver({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: fetchNextPageWithPreserve,
    rootMargin: SCROLL_CONFIG.TOP_SENTINEL_ROOT_MARGIN,
  });

  const { sentinelRef: bottomSentinelRef } = useIntersectionObserver({
    hasNextPage: hasPreviousPage && !isJumping,
    isFetchingNextPage: isFetchingPreviousPage,
    fetchNextPage: fetchPreviousPageWithPreserve,
    rootMargin: SCROLL_CONFIG.BOTTOM_SENTINEL_ROOT_MARGIN,
  });

  const scrollToMessage = async (messageId: number) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      highlightMessage(el);
      return;
    }
    if (!currentChatId) return;

    try {
      const { page } = await chatsApi.getMessagePage(currentChatId, messageId);
      setIsJumping(true);
      clearAndReset(currentChatId);
      setPendingScrollId(messageId);
      setStartPage(page);
    } catch (err) {
      console.error(err);
      setIsJumping(false);
    }
  };

  const tryScrollWithRetry = useCallback((messageId: number) => {
    const attempt = (attemptsLeft: number) => {
      const el = document.getElementById(`message-${messageId}`);
      if (el) {
        highlightMessage(el);
        setPendingScrollId(null);
        setTimeout(() => setIsJumping(false), SCROLL_CONFIG.JUMP_RESET_DELAY_MS);
        return;
      }
      if (attemptsLeft > 0) {
        requestAnimationFrame(() => attempt(attemptsLeft - 1));
      } else {
        setIsJumping(false);
      }
    };
    attempt(2);
  }, []);

  useEffect(() => {
    if (!pendingScrollId || isLoading) return;
    tryScrollWithRetry(pendingScrollId);
  }, [pendingScrollId, isLoading, data?.pages?.length]);

  return {
    isAtBottom,
    startPage,
    topSentinelRef,
    bottomSentinelRef,
    scrollToMessage,
    scrollContainerRef,
    bottomRef,
    setIsJumping,
  };
}
