import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}
function buildPageHref(basePath: string, page: number): string {
  const [path, queryString] = basePath.split("?");
  const params = new URLSearchParams(queryString);
  params.set("page", String(page));
  return `${path}?${params.toString()}`;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = "?",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <Link
        href={isFirstPage ? "#" : buildPageHref(basePath, currentPage - 1)}
        aria-disabled={isFirstPage}
        aria-label="Previous page"
        tabIndex={isFirstPage ? -1 : undefined}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm transition-colors hover:bg-gray-50 ${
          isFirstPage ? "pointer-events-none opacity-40" : ""
        }`}
      >
        ‹
      </Link>

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center text-sm text-gray-400"
          >
            ···
          </span>
        ) : (
          <Link
            key={page}
            href={buildPageHref(basePath, page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {page}
          </Link>
        ),
      )}

      <Link
        href={isLastPage ? "#" : buildPageHref(basePath, currentPage + 1)}
        aria-disabled={isLastPage}
        aria-label="Next page"
        tabIndex={isLastPage ? -1 : undefined}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm transition-colors hover:bg-gray-50 ${
          isLastPage ? "pointer-events-none opacity-40" : ""
        }`}
      >
        ›
      </Link>
    </div>
  );
}