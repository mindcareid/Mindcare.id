import type {  Prisma, Order } from "@prisma/client";

export interface OrderWithEvent extends Order {
  event: {
    title: string;
    startDate: Date;
    location?: string | null;
  };
  _count: {
    ticket: number;
  };
}

export type OrderEvent = Prisma.OrderGetPayload<{
  include: {
    user: true;
    event: {
      include: {
        company: true;
      };
    };
    ticket: true;
    paymentLogs: true;
    _count: {
      select: {
        ticket: true;
      };
    };
  };
}>;

export type SortOptions = "date-desc" | "date-asc" | "name-asc" | "name-desc";
export type StatusFilter = "ALL" | "PAID" | "PENDING" | "EXPIRED" | "CANCELED";

export function shortOrderId(id: string): string {
  return id.slice(-6).toUpperCase();
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function sortOrders(
  orders: OrderWithEvent[],
  sort: SortOptions,
): OrderWithEvent[] {
  return [...orders].sort((a, b) => {
    switch (sort) {
      case "date-desc":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "date-asc":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "name-asc":
        return a.event.title.localeCompare(b.event.title);
      case "name-desc":
        return b.event.title.localeCompare(a.event.title);
    }
  });
}
