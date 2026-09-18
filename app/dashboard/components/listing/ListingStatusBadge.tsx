import { cn } from "@/lib/utils";

export type ListingStatusValue = "PENDING" | "LISTED" | "REJECTED";

const STATUS_STYLES: Record<ListingStatusValue, string> = {
  PENDING: "bg-brand-lavender-100 text-secondary",
  LISTED: "bg-brand-mint-100 text-accent",
  REJECTED: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<ListingStatusValue, string> = {
  PENDING: "Under review",
  LISTED: "Live",
  REJECTED: "Not approved",
};

export function listingStatusLabel(status: ListingStatusValue): string {
  return STATUS_LABELS[status];
}

export default function ListingStatusBadge({
  status,
  className,
}: {
  status: ListingStatusValue;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
