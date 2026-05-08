import { useCallback, useRef } from 'react';

export const useDebounce = (callback: (...args: any[]) => void, delayMs: number = 300) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        callback(...args);
      }, delayMs);
    },
    [callback, delayMs],
  );
};
