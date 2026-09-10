import type { OrderWithEvent } from "@/lib/orders";

type Status = OrderWithEvent["status"];

const statusConfig: Record<
  Status,
  { label: string; className: string }
> = {
  PAID: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-red-500/10 text-red-500 ring-red-500/20",
  },
  CANCELED: {
    label: "Canceled",
    className: "bg-slate-500/10 text-slate-500 ring-slate-500/20",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-purple-100 text-purple-700",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? statusConfig.CANCELED;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  );
}