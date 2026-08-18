import Link from "next/link";
import type { OrderWithEvent } from "@/lib/orders";

export function ActionButton({ order }: { order: OrderWithEvent }) {
  if (order.status === "PENDING" && order.invoiceUrl) {
    return (
      <a
        href={order.invoiceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 ring-2 ring-inset ring-amber-500/20 transition-colors hover:bg-amber-500/20"
      >
        Pay Now
      </a>
    );
  }

 if (order.status === "PAID") {
  return (
    <div className="flex gap-2">
      <Link
        href={`/dashboard/my-ticket?orderId=${order.id}`}
        className="inline-flex items-center rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 ring-2 ring-emerald-500/20 transition-colors hover:bg-emerald-500/20"
      >
        View Ticket
      </Link>

      {order.amount > 0 && (
          <Link
            href={`/dashboard/invoice/${order.id}`}
            className="inline-flex items-center rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 ring-2 ring-blue-500/20 transition-colors hover:bg-blue-500/20"
          >
            View Invoice
          </Link>
        )}
    </div>
  );
}

  // Status lain (EXPIRED, CANCELED) tidak butuh aksi
  return <span className="text-xs text-muted-foreground">—</span>;
}
