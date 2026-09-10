import type { OrderWithEvent } from "@/lib/orders";
import { formatDate, formatPrice, shortOrderId } from "@/lib/orders";
import { StatusBadge } from "./StatusBadge";
import { ActionButton } from "./ActionButton";

export function OrderCard({ order }: { order: OrderWithEvent }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30">
      {/* Top: event title + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium leading-snug text-foreground">
            {order.event.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(order.event.startDate)}
            {order.event.location ? ` · ${order.event.location}` : ""}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Meta grid 2x2 */}
      <div className="mt-3 grid grid-cols-2 gap-y-2.5 border-t border-border pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Amount
          </p>
          <p className="mt-0.5 text-xs md:text-sm font-medium text-foreground">
            {formatPrice(order.amount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Tickets
          </p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {order._count.tickets} ticket{order._count.tickets > 1 ? "s" : ""}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Order ID
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            #{shortOrderId(order.id)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Date
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="mt-3 flex justify-end">
        <ActionButton order={order} />
      </div>
    </div>
  );
}
