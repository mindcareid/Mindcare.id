"use client";

import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<T extends unknown[]>(
  callback: (...args: T) => void,
  delay = 300,
) {
  const timeoutRef =
    useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
}