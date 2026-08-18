"use client";

import { memo } from "react";

export type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
};

function FilterSelectComponent<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  className,
}: Props<T>) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="
          h-11
          w-full

          rounded-xl
          border
          border-border

          bg-background

          px-3
          pr-10

          text-sm

          appearance-none

          focus:outline-none
          focus:ring-1
          focus:ring-neutral-300
        "
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div
        className="
          pointer-events-none
          absolute
          right-3
          top-1/2
          -translate-y-1/2
        "
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 9l-7 7-7-7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </div>
    </div>
  );
}

// IMPORTANT: preserve generic with memo

export default memo(
  FilterSelectComponent,
) as typeof FilterSelectComponent;