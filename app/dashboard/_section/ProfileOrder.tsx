import Link from "next/link";
import { Receipt } from "lucide-react";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { formatDate } from "@/lib/utils/FormatDate";

export type ProfileOrderItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  ticketCount: number;
  createdAt?: string | Date | null;
  event: { title: string };
};

const STATUS_STYLE: Record<string, string> = {
  PAID: "bg-brand-mint-100 text-accent",
  PENDING: "bg-brand-lavender-100 text-secondary",
  EXPIRED: "bg-muted text-muted-foreground",
  FAILED: "bg-destructive/10 text-destructive",
};

function statusStyle(status: string) {
  return STATUS_STYLE[status] ?? "bg-muted text-muted-foreground";
}

export default function ProfileUserOrder({
  orders,
}: {
  orders: ProfileOrderItem[];
}) {
  return (
    <section className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-card md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Receipt className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Recent orders
            </h2>
            <p className="text-sm text-muted-foreground">
              {orders.length === 0
                ? "No purchases yet"
                : `${orders.length} latest`}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/orders"
          className={buttonStyles({ variant: "ghost", size: "sm" })}
        >
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You have no orders yet.
          </p>
          <Link
            href="/events"
            className={buttonStyles({
              variant: "outline",
              size: "sm",
              className: "mt-3",
            })}
          >
            Browse events
          </Link>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-border">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {order.event.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {order.ticketCount} ticket
                  {order.ticketCount === 1 ? "" : "s"}
                  {order.createdAt ? ` · ${formatDate(order.createdAt)}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {order.amount === 0
                    ? "Free"
                    : `Rp ${order.amount.toLocaleString("id-ID")}`}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
