import { HiMiniChevronRight, HiMiniChevronLeft } from "react-icons/hi2";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Buat array halaman — kalau banyak, pakai ellipsis agar tidak overflow
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <HiMiniChevronLeft className="h-4 w-4" />
      </button>

      {getPages().map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
          >
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-8 w-8 items-center justify-center font-medium  rounded-lg text-sm transition-colors ${
              page === currentPage
                ? "bg-foreground text-background "
                : "border border-border hover:bg-gray-300 "
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <HiMiniChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
