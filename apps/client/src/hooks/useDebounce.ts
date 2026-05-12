// import { useEffect, useState } from 'react';

// const useDebounce = (value: any, delayMs: number = 300) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const t = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delayMs);

//     return () => {
//       clearTimeout(t);
//     };
//   }, [value, delayMs]);
//   return debouncedValue;
// };

// export default useDebounce;
import { useCallback, useEffect, useRef } from 'react';

export default function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
