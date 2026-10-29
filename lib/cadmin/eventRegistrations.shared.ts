/**
 * Bagian yang boleh dipakai bersama server dan browser.
 *
 * File ini SENGAJA tidak mengimpor Prisma atau apa pun dari Node. Client
 * component mengimpor dari sini, bukan dari `eventRegistrations.ts`, supaya
 * bundel browser tidak ikut menarik `node:async_hooks` lewat `lib/prisma`.
 */

export const ORDER_STATUS_VALUES = [
  "PENDING",
  "PAID",
  "EXPIRED",
  "CANCELED",
  "REFUNDED",
] as const;

export type OrderStatusFilter = (typeof ORDER_STATUS_VALUES)[number];

export const STATUS_TABS: { value: OrderStatusFilter | ""; label: string }[] = [
  { value: "", label: "All" },
  ...ORDER_STATUS_VALUES.map((value) => ({
    value,
    label: value.charAt(0) + value.slice(1).toLowerCase(),
  })),
];

/** Bentuk filter yang dipakai list dan export. */
export type RegistrationFilters = {
  eventId?: number;
  status?: OrderStatusFilter;
  search?: string;
  page: number;
};

export const MAX_EXPORT_ROWS = 10000;

export const PAGE_SIZE = 25;

export function buildFilterParams(
  filters: Omit<RegistrationFilters, "page"> & { page?: number },
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.eventId) params.set("eventId", String(filters.eventId));
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  return params;
}
