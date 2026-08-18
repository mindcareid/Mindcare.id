"use client";

import type { StatusFilter, SortOptions } from "@/lib/orders";

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Paid", value: "PAID" },
  { label: "Pending", value: "PENDING" },
  { label: "Expired", value: "EXPIRED" },
];

const SORT_OPTIONS: { label: string; value: SortOptions }[] = [
  { label: "Newest first", value: "date-desc" },
  { label: "Oldest first", value: "date-asc" },
  { label: "Event A–Z", value: "name-asc" },
  { label: "Event Z–A", value: "name-desc" },
];

interface OrderFilterBarProps {
  activeFilter: StatusFilter;
  activeSort: SortOptions;
  totalCount: number;
  onFilterChange: (filter: StatusFilter) => void;
  onSortChange: (sort: SortOptions) => void;
}

export function OrderFilterBar({
  activeFilter,
  activeSort,
  totalCount,
  onFilterChange,
  onSortChange,
}: OrderFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`rounded-full px-3 py-1 text-sm bg-gray-200 hover:bg-gray-400 font-medium ring-1 ring-inset transition-colors ${
              activeFilter === f.value
                ? "bg-foreground text-background ring-transparent"
                : "bg-transparent text-muted-foreground ring-border hover:bg-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex justify-end items-center gap-3">
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as SortOptions)}
          className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs text-foreground outline-none transition-colors hover:bg-muted focus:ring-1 focus:ring-ring"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
