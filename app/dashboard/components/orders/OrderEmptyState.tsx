import Link from "next/link";
import { LuReceiptText, LuSearch, LuX } from "react-icons/lu";

interface OrderEmptyStateProps {
  isFiltered?: boolean;
  onClearFilter?: () => void;
}

export function OrderEmptyState({
  isFiltered = false,
  onClearFilter,
}: OrderEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background py-16 px-6 text-center">
      <div className="relative mb-5">
        <div
          className={`w-18 h-18 rounded-full flex items-center justify-content-center p-5 ${
            isFiltered ? "bg-amber-50" : "bg-blue-50"
          }`}
        >
          {isFiltered ? (
            <LuSearch className="w-8 h-8 text-amber-500" />
          ) : (
            <LuReceiptText className="w-8 h-8 text-blue-500" />
          )}
        </div>

        <span
          className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${isFiltered ? "bg-amber-200" : "bg-blue-200"}`}
        />
        <span
          className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full opacity-60 ${isFiltered ? "bg-amber-300" : "bg-purple-200"}`}
        />
      </div>

      {/* Pesan */}
      <p className="text-base font-semibold text-foreground mb-1.5">
        {isFiltered ? "No orders found" : "No orders yet"}
      </p>
      <p className="text-sm text-muted-foreground max-w-60 leading-relaxed mb-5">
        {isFiltered
          ? "No results match your current filter. Try adjusting or clearing it."
          : "You haven't registered for any events. Find one and secure your spot today."}
      </p>

      {isFiltered ? (
        <button
          onClick={onClearFilter}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <LuX className="w-4 h-4" />
          Clear Filter
        </button>
      ) : (
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          <LuSearch className="w-4 h-4" />
          Browse Events
        </Link>
      )}
    </div>
  );
}
