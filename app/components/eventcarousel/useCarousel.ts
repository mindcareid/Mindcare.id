"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Options = {
  autoplay?: boolean;
  interval?: number;
};

export function useCarousel({
  autoplay = false,
  interval = 4000,
}: Options = {}) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [canPrev, setCanPrev] =
    useState(false);

  const [canNext, setCanNext] =
    useState(false);

  const [isHovering, setIsHovering] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  const updateButtons =
    useCallback(() => {
      const el = containerRef.current;

      if (!el) return;

      setCanPrev(el.scrollLeft > 5);

      setCanNext(
        el.scrollLeft <
          el.scrollWidth -
            el.clientWidth -
            5,
      );
    }, []);

  const scroll =
    useCallback(
      (
        direction: "left" | "right",
      ) => {
        const el =
          containerRef.current;

        if (!el) return;

        const card =
          el.querySelector<HTMLElement>(
            "[data-carousel-card]",
          );

        const width =
          card?.offsetWidth ?? 300;

        const gap = 16;

        el.scrollBy({
          left:
            direction === "left"
              ? -(width + gap)
              : width + gap,

          behavior: "smooth",
        });
      },
      [],
    );

  useEffect(() => {
    updateButtons();

    const el = containerRef.current;

    if (!el) return;

    el.addEventListener(
      "scroll",
      updateButtons,
    );

    window.addEventListener(
      "resize",
      updateButtons,
    );

    return () => {
      el.removeEventListener(
        "scroll",
        updateButtons,
      );

      window.removeEventListener(
        "resize",
        updateButtons,
      );
    };
  }, [updateButtons]);

  useEffect(() => {
    if (
      !autoplay ||
      isHovering ||
      isDragging
    )
      return;

    const timer = setInterval(() => {
      const el =
        containerRef.current;

      if (!el) return;

      const atEnd =
        el.scrollLeft >=
        el.scrollWidth -
          el.clientWidth -
          10;

      if (atEnd) {
        el.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        scroll("right");
      }
    }, interval);

    return () =>
      clearInterval(timer);
  }, [
    autoplay,
    interval,
    isHovering,
    isDragging,
    scroll,
  ]);

  return {
    containerRef,

    canPrev,
    canNext,

    scroll,

    setIsHovering,
    setIsDragging,
  };
}