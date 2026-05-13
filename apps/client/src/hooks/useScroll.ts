import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import useChatUIStore from '../stores/chatUI';
import { useIntersectionObserver } from './useIntersectionObserver';
import chatsApi from '../api/chats/chats';

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
}) {
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
      { threshold: 0.1 },
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
    rootMargin: '300px',
  });

  const { sentinelRef: bottomSentinelRef } = useIntersectionObserver({
    hasNextPage: hasPreviousPage && !isJumping,
    isFetchingNextPage: isFetchingPreviousPage,
    fetchNextPage: fetchPreviousPageWithPreserve,
    rootMargin: '0px',
  });

  const highlightMessage = (el: HTMLElement) => {
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
    el.classList.add('highlight-message');
    setTimeout(() => el.classList.remove('highlight-message'), 2000);
  };

  const scrollToMessage = async (messageId: number) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      highlightMessage(el);
      return;
    }

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

  useEffect(() => {
    if (!pendingScrollId || isLoading) return;

    const tryScroll = (): boolean => {
      const el = document.getElementById(`message-${pendingScrollId}`);
      if (!el) return false;

      highlightMessage(el);
      setPendingScrollId(null);

      setTimeout(() => setIsJumping(false), 400);
      return true;
    };

    if (!tryScroll()) {
      requestAnimationFrame(() => {
        if (!tryScroll()) {
          setTimeout(() => {
            tryScroll();
            setIsJumping(false);
          }, 400);
        }
      });
    }
  }, [pendingScrollId, isLoading, data]);

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
