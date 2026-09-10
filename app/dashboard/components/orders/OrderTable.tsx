import type { OrderWithEvent } from "@/lib/orders";
import { formatDate, formatPrice, shortOrderId } from "@/lib/orders";
import { StatusBadge } from "./StatusBadge";
import { ActionButton } from "./ActionButton";

export function OrderTable({ orders }: { orders: OrderWithEvent[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {[
              "Order ID",
              "Event",
              "Tickets",
              "Amount",
              "Status",
              "Date",
              "",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border bg-card">
          {orders.map((order) => (
            <tr key={order.id} className="transition-colors hover:bg-muted/30">
              {/* Order ID — cukup tampilkan short ID, full ID bisa di detail page */}
              <td className="px-4 py-3.5 font-mono text-md text-muted-foreground">
                #{shortOrderId(order.id)}
              </td>

              {/* Event info */}
              <td className="px-4 py-3.5">
                <p className="max-w-50 truncate font-medium text-foreground">
                  {order.event.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(order.event.startDate)}
                </p>
              </td>

              {/* Ticket count */}
              <td className="px-4 py-3.5 text-center font-medium text-foreground">
                {order._count.tickets}
              </td>

              {/* Amount */}
              <td className="px-4 py-3.5 font-medium text-foreground">
                {formatPrice(order.amount)}
              </td>

              {/* Status */}
              <td className="px-4 py-3.5">
                <StatusBadge status={order.status} />
              </td>

              {/* Created date */}
              <td className="px-4 py-3.5 text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </td>

              {/* Action */}
              <td className="px-4 py-3.5">
                <ActionButton order={order} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
