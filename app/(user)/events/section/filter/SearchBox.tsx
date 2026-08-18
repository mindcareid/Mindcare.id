"use client";

import { memo } from "react";
import { FiSearch } from "react-icons/fi";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function SearchBox({
  value,
  onChange,
  placeholder = "Search Events...",
}: Props) {
  return (
    <div className="relative flex-1 min-w-0">
      <FiSearch
        className="
          absolute
          left-3.5
          top-1/2
          -translate-y-1/2
          h-4
          w-4
          text-muted-foreground
          pointer-events-none
        "
      />

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          h-11
          pl-11
          pr-4
          rounded-xl
          border
          border-border
          bg-background
          text-md
          md:text-lg
          placeholder:text-muted-foreground/60
          focus:outline-none
          focus:ring-1
          focus:ring-ring/20
          focus:border-foreground/30
          transition-all
        "
      />
    </div>
  );
}

export default memo(SearchBox);