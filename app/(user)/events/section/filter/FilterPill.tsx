"use client";

import { memo } from "react";
import clsx from "clsx";

type FilterPillProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

function FilterPill({
  active,
  onClick,
  children,
  disabled = false,
  className,
}: FilterPillProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "px-4 py-1.5 rounded-full text-xs md:text-sm border transition-all duration-200",
        "whitespace-nowrap shrink-0 font-medium",
        "focus:outline-none focus:ring-2 focus:ring-neutral-300",
        {
          "bg-neutral-900 border-neutral-900 text-white shadow-sm":
            active,

          "bg-white border-gray-300 text-gray-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900":
            !active,

          "opacity-50 cursor-not-allowed":
            disabled,
        },
        className,
      )}
    >
      {children}
    </button>
  );
}

export default memo(FilterPill);