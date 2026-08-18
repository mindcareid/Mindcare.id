"use client";

import { memo } from "react";
import { IoClose } from "react-icons/io5";

export type FilterBadge = {
  key: string;
  label: string;
};

type Props = {
  badges: FilterBadge[];
  onRemove: (key: string) => void;
};

function FilterBadges({
  badges,
  onRemove,
}: Props) {
  if (!badges.length) return null;

  return (
    <div className="mt-3">
      <span
        className="
          text-xs
          md:text-sm
          font-semibold
          text-muted-foreground
          tracking-wide
        "
      >
        Filter
      </span>

      <div className="flex flex-wrap gap-2 mt-2">
        {badges.map((badge) => (
          <button
            key={badge.key}
            type="button"
            onClick={() => onRemove(badge.key)}
            className="
              inline-flex
              items-center
              gap-1.5
              px-3
              py-1.5
              rounded-full
              text-xs
              md:text-sm
              font-medium
              bg-neutral-900
              text-white
              border
              border-neutral-900
              hover:bg-white
              hover:text-neutral-900
              transition-all
            "
          >
            {badge.label}

            <IoClose className="w-3 h-3" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(FilterBadges);