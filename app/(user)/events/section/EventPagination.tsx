"use client";

import { memo, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { EventMeta } from "@/lib/events/types";

type Props = {
  meta: EventMeta;
  currentPage: number;
  onPageChange: (page: number) => void;
};

function EventsPagination({
  meta,
  currentPage,
  onPageChange,
}: Props) {
  const { totalPages } = meta;

  const pages = useMemo(() => {
    if (totalPages <= 1) return [];

    const delta = 2;
    const result: (number | "...")[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta &&
          i <= currentPage + delta)
      ) {
        result.push(i);
      } else if (
        result[result.length - 1] !== "..."
      ) {
        result.push("...");
      }
    }

    return result;
  }, [currentPage, totalPages]);

  const previous = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const next = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center py-10">
      <div className="flex items-center gap-1">

        <button
          onClick={previous}
          disabled={currentPage === 1}
          className="
            flex h-9 w-9 items-center justify-center
            rounded-lg border border-border
            text-muted-foreground
            transition
            hover:border-primary
            hover:text-primary
            disabled:pointer-events-none
            disabled:opacity-40
          "
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() =>
                onPageChange(page)
              }
              className={`
                flex h-9 min-w-9 items-center justify-center
                rounded-lg border px-3
                text-sm font-medium
                transition
                ${
                  page === currentPage
                    ? "border-blue-600 bg-blue-600 text-white shadow-md"
                    : "border-border text-muted-foreground hover:bg-gray-100"
                }
              `}
            >
              {page}
            </button>
          ),
        )}

        <button
          onClick={next}
          disabled={
            currentPage === totalPages
          }
          className="
            flex h-9 w-9 items-center justify-center
            rounded-lg border border-border
            text-muted-foreground
            transition
            hover:border-primary
            hover:text-primary
            disabled:pointer-events-none
            disabled:opacity-40
          "
        >
          <ChevronRight className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
}

export default memo(EventsPagination);