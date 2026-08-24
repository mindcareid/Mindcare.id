"use client";

import type { ComponentType } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";


export type FilterBarOption = {
  value: string;
  label: string;
};

export type FilterBarField = {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  value: string;
  options: FilterBarOption[];
  onValueChange: (value: string) => void;
};

type FilterBarProps = {
  fields: FilterBarField[];
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
};

export default function FilterBar({
  fields,
  onReset,
  resetLabel = "Reset all",
  className,
}: FilterBarProps) {
  if (fields.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-2 shadow-search",
        "flex flex-col gap-2 md:flex-row md:items-stretch",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-stretch md:gap-0">
        {fields.map((field, index) => {
          const Icon = field.icon;
          const selectId = `filterbar-${field.id}`;

          return (
            <div
              key={field.id}
              className={cn(
                "relative flex-1 rounded-lg px-3 py-2",
                "focus-within:ring-2 focus-within:ring-ring",
                index > 0 && "md:border-l md:border-border",
              )}
            >
              <label
                htmlFor={selectId}
                className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground"
              >
                {Icon && <Icon className="size-3.5 shrink-0" />}
                {field.label}
              </label>

              <div className="relative mt-0.5">
                <select
                  id={selectId}
                  value={field.value}
                  onChange={(event) => field.onValueChange(event.target.value)}
                  className="w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-sm font-semibold text-foreground outline-none"
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className={cn(
            "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-secondary",
            "transition-colors hover:bg-brand-lavender-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {resetLabel}
        </button>
      )}
    </div>
  );
}
