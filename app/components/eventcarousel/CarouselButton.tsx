"use client";

import { memo } from "react";

import clsx from "clsx";

import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

type Props = {
  direction: "left" | "right";

  disabled?: boolean;

  onClick: () => void;
};

function CarouselButton({
  direction,
  disabled = false,
  onClick,
}: Props) {
  const Icon =
    direction === "left"
      ? FiChevronLeft
      : FiChevronRight;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        `
        flex
        h-10
        w-10
        items-center
        justify-center

        rounded-full

        border

        bg-white

        shadow-sm

        transition-all

        duration-200
        `,
        disabled
          ? "cursor-not-allowed opacity-30"
          : `
            hover:-translate-y-0.5
            hover:bg-neutral-900
            hover:text-white
            hover:shadow-lg
          `,
      )}
    >
      <Icon className="text-xl" />
    </button>
  );
}

export default memo(CarouselButton);