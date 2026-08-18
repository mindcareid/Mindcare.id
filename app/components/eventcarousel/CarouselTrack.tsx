"use client";

import {
  memo,
  useEffect,
  useRef,
} from "react";

type Props = {
  containerRef: React.RefObject<HTMLDivElement | null>;


  setIsHovering: (
    value: boolean,
  ) => void;

  setIsDragging: (
    value: boolean,
  ) => void;

  children: React.ReactNode;
};

function CarouselTrack({
  containerRef,
  setIsHovering,
  setIsDragging,
  children,
}: Props) {
  const pressed =
    useRef(false);

  const startX =
    useRef(0);

  const scrollLeft =
    useRef(0);

  useEffect(() => {
    const el =
      containerRef.current;

    if (!el) return;

    const mouseDown = (
      e: MouseEvent,
    ) => {
      pressed.current = true;

      setIsDragging(true);

      startX.current =
        e.pageX -
        el.offsetLeft;

      scrollLeft.current =
        el.scrollLeft;

      el.style.cursor =
        "grabbing";

      el.style.userSelect =
        "none";
    };

    const mouseLeave = () => {
      pressed.current = false;

      setIsDragging(false);

      el.style.cursor = "grab";

      el.style.removeProperty(
        "user-select",
      );
    };

    const mouseUp = () => {
      pressed.current = false;

      setIsDragging(false);

      el.style.cursor = "grab";

      el.style.removeProperty(
        "user-select",
      );
    };

    const mouseMove = (
      e: MouseEvent,
    ) => {
      if (!pressed.current)
        return;

      e.preventDefault();

      const x =
        e.pageX -
        el.offsetLeft;

      const walk =
        (x -
          startX.current) *
        1.2;

      el.scrollLeft =
        scrollLeft.current -
        walk;
    };

    el.addEventListener(
      "mousedown",
      mouseDown,
    );

    window.addEventListener(
      "mouseup",
      mouseUp,
    );

    window.addEventListener(
      "mousemove",
      mouseMove,
    );

    el.addEventListener(
      "mouseleave",
      mouseLeave,
    );

    return () => {
      el.removeEventListener(
        "mousedown",
        mouseDown,
      );

      window.removeEventListener(
        "mouseup",
        mouseUp,
      );

      window.removeEventListener(
        "mousemove",
        mouseMove,
      );

      el.removeEventListener(
        "mouseleave",
        mouseLeave,
      );
    };
  }, [
    containerRef,
    setIsDragging,
  ]);

  useEffect(() => {
    const el =
      containerRef.current;

    if (!el) return;

    const keyDown = (
      e: KeyboardEvent,
    ) => {
      if (
        e.key ===
        "ArrowRight"
      ) {
        el.scrollBy({
          left: 350,
          behavior:
            "smooth",
        });
      }

      if (
        e.key ===
        "ArrowLeft"
      ) {
        el.scrollBy({
          left: -350,
          behavior:
            "smooth",
        });
      }
    };

    window.addEventListener(
      "keydown",
      keyDown,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        keyDown,
      );
  }, [containerRef]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() =>
        setIsHovering(true)
      }
      onMouseLeave={() =>
        setIsHovering(false)
      }
      className="
        flex
        gap-4

        overflow-x-auto

        scroll-smooth

        snap-x
        snap-mandatory

        pb-3

        cursor-grab

        no-scrollbar

        select-none
      "
    >
      {children}
    </div>
  );
}

export default memo(
  CarouselTrack,
);