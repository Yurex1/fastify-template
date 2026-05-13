import { useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
  rootMargin?: string;
}

export const useIntersectionObserver = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 0.3,
  rootMargin = '0px',
}: UseIntersectionObserverProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ hasNextPage, isFetchingNextPage, fetchNextPage });
  const inFlightRef = useRef(false);

  stateRef.current = { hasNextPage, isFetchingNextPage, fetchNextPage };

  useEffect(() => {
    if (!isFetchingNextPage) {
      inFlightRef.current = false;
    }
  }, [isFetchingNextPage]);

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      const { hasNextPage, isFetchingNextPage, fetchNextPage } = stateRef.current;
      if (!entry.isIntersecting || !hasNextPage || isFetchingNextPage || inFlightRef.current) {
        return;
      }
      inFlightRef.current = true;
      fetchNextPage();
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold,
      rootMargin,
    });
    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isFetchingNextPage) return;

    const sentinel = sentinelRef.current;
    const container = sentinel?.parentElement;
    if (!sentinel || !container) return;

    const onScroll = () => {
      const { hasNextPage, isFetchingNextPage, fetchNextPage } = stateRef.current;
      if (inFlightRef.current || isFetchingNextPage || !hasNextPage) return;

      const sentinelRect = sentinel.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const visible = sentinelRect.top < containerRect.bottom && sentinelRect.bottom > containerRect.top;

      if (visible) {
        inFlightRef.current = true;
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', onScroll, { once: true, passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [isFetchingNextPage]);

  return { sentinelRef };
};
