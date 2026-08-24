"use client";

import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
export type SortOption = {
  value: string;
  label: string;
};

type SortSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SortOption[];
  label?: string;
  className?: string;
};

export default function SortSelect({
  value,
  onValueChange,
  options,
  label = "Sort by",
  className,
}: SortSelectProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-lg border border-border bg-card",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
    >
      <ArrowUpDown
        className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-label={label}
        className="w-full cursor-pointer appearance-none bg-transparent py-2.5 pl-9 pr-4 text-sm font-medium text-foreground outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {label}: {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
