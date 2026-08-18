import { useEffect, useState } from "react";

/**
 * Debounce a value.
 *
 * @param value Value yang ingin di-debounce
 * @param delay Delay dalam milidetik (default 300ms)
 */
export function useDebounce<T>(
  value: T,
  delay: number = 300,
): T {
  const [debouncedValue, setDebouncedValue] =
    useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}