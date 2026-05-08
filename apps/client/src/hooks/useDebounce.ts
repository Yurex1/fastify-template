import { useEffect, useState } from 'react';

const useDebounce = (value: any, delayMs: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(t);
    };
  }, [value, delayMs]);
  return debouncedValue;
};

export default useDebounce;
