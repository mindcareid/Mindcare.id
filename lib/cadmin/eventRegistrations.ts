import { OrderStatus, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  ORDER_STATUS_VALUES,
  PAGE_SIZE,
  type OrderStatusFilter,
  type RegistrationFilters,
} from "@/lib/cadmin/eventRegistrations.shared";

const PLATFORM_EVENT_WHERE = {
  publisherType: "PLATFORM" as const,
  deletedAt: null,
};

export function parseFilters(
  searchParams: URLSearchParams,
): RegistrationFilters {
  const eventIdRaw = Number(searchParams.get("eventId"));
  const eventId =
    Number.isInteger(eventIdRaw) && eventIdRaw > 0 ? eventIdRaw : undefined;

  const statusRaw = searchParams.get("status");
  const status = ORDER_STATUS_VALUES.includes(statusRaw as OrderStatusFilter)
    ? (statusRaw as OrderStatusFilter)
    : undefined;

  const search = searchParams.get("search")?.trim() || undefined;

  const pageRaw = Number(searchParams.get("page"));
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return { eventId, status, search, page };
}

/**
 * Satu baris = satu tiket = satu pendaftar. `status` melekat pada order,
 * sedangkan `search` harus di level tiket: kalau dicari di order, satu
 * pembeli dengan beberapa peserta akan memunculkan semua peserta walau
 * hanya satu yang cocok.
 */
export function buildTicketWhere(
  filters: RegistrationFilters,
): Prisma.TicketWhereInput {
  const eventFilter: Prisma.EventWhereInput = { ...PLATFORM_EVENT_WHERE };
  if (filters.eventId) eventFilter.id = filters.eventId;

  const orderFilter: Prisma.OrderWhereInput = { event: eventFilter };
  if (filters.status) orderFilter.status = filters.status as OrderStatus;

  const where: Prisma.TicketWhereInput = { order: orderFilter };

  if (filters.search) {
    where.OR = [
      { attendeeName: { contains: filters.search } },
      { attendeeEmail: { contains: filters.search } },
    ];
  }

  return where;
}

/** Daftar event platform untuk dropdown filter. */
export async function listPlatformEvents() {
  return prisma.event.findMany({
    where: PLATFORM_EVENT_WHERE,
    select: { id: true, title: true, startDate: true, quota: true },
    orderBy: { startDate: "desc" },
  });
}

export type RegistrationSummary = {
  totalRegistrants: number;
  paidRegistrants: number;
  pendingRegistrants: number;
  checkedIn: number;
  revenue: number;
};

export async function loadRegistrationSummary(
  filters: RegistrationFilters,
): Promise<RegistrationSummary> {
  const where = buildTicketWhere(filters);
  const orderWhere = where.order as Prisma.OrderWhereInput;
  const withStatus = (status: OrderStatus): Prisma.TicketWhereInput => ({
    ...where,
    order: { ...orderWhere, status },
  });

  const [
    totalRegistrants,
    paidRegistrants,
    pendingRegistrants,
    checkedIn,
    revenue,
  ] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.count({ where: withStatus("PAID") }),
    prisma.ticket.count({ where: withStatus("PENDING") }),
    prisma.ticket.count({
      where: { ...withStatus("PAID"), isCheckedIn: true },
    }),
    prisma.order.aggregate({
      where: { ...orderWhere, status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalRegistrants,
    paidRegistrants,
    pendingRegistrants,
    checkedIn,
    revenue: revenue._sum.amount ?? 0,
  };
}

export type RegistrationRow = {
  ticketId: string;
  code: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string | null;
  attendeeData: Record<string, unknown>;
  isCheckedIn: boolean;
  checkedAt: Date | null;
  registeredAt: Date;
  orderId: string;
  orderStatus: OrderStatus;
  orderAmount: number;
  paidAt: Date | null;
  eventId: number;
  eventTitle: string;
  eventStartDate: Date;
  buyer: { name: string; email: string } | null;
};

const TICKET_SELECT = {
  id: true,
  code: true,
  attendeeName: true,
  attendeeEmail: true,
  attendeePhone: true,
  attendeeData: true,
  isCheckedIn: true,
  checkedAt: true,
  createdAt: true,
  order: {
    select: {
      id: true,
      status: true,
      amount: true,
      paidAt: true,
      guestEmail: true,
      user: { select: { name: true, email: true } },
      event: { select: { id: true, title: true, startDate: true } },
    },
  },
} satisfies Prisma.TicketSelect;

type SelectedTicket = Prisma.TicketGetPayload<{ select: typeof TICKET_SELECT }>;

function toRow(ticket: SelectedTicket): RegistrationRow {
  const order = ticket.order;
  return {
    ticketId: ticket.id,
    code: ticket.code,
    attendeeName: ticket.attendeeName,
    attendeeEmail: ticket.attendeeEmail,
    attendeePhone: ticket.attendeePhone,
    attendeeData:
      ticket.attendeeData && typeof ticket.attendeeData === "object"
        ? (ticket.attendeeData as Record<string, unknown>)
        : {},
    isCheckedIn: ticket.isCheckedIn,
    checkedAt: ticket.checkedAt,
    registeredAt: ticket.createdAt,
    orderId: order.id,
    orderStatus: order.status,
    orderAmount: order.amount,
    paidAt: order.paidAt,
    eventId: order.event.id,
    eventTitle: order.event.title,
    eventStartDate: order.event.startDate,
    buyer: order.user
      ? { name: order.user.name, email: order.user.email }
      : order.guestEmail
        ? { name: order.guestEmail, email: order.guestEmail }
        : null,
  };
}

export async function loadRegistrations(
  filters: RegistrationFilters,
  options: { take?: number; skip?: number } = {},
): Promise<{ rows: RegistrationRow[]; total: number }> {
  const where = buildTicketWhere(filters);
  const take = options.take ?? PAGE_SIZE;
  const skip = options.skip ?? (filters.page - 1) * PAGE_SIZE;

  const [total, tickets] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: TICKET_SELECT,
    }),
  ]);

  return { rows: tickets.map(toRow), total };
}

/** Versi generator untuk export: satu batch kecil di memori sekaligus. */
export async function* iterateRegistrations(
  filters: RegistrationFilters,
  batchSize = 500,
): AsyncGenerator<RegistrationRow> {
  const where = buildTicketWhere(filters);
  let lastCreatedAt: Date | null = null;
  let lastId: string | null = null;

  while (true) {
    // Keyset, bukan OFFSET: halaman ke-20 tidak perlu memindai 10.000 baris.
    const cursorWhere: Prisma.TicketWhereInput =
      lastCreatedAt && lastId
        ? {
            AND: [
              where,
              {
                OR: [
                  { createdAt: { lt: lastCreatedAt } },
                  { createdAt: lastCreatedAt, id: { lt: lastId } },
                ],
              },
            ],
          }
        : where;

    const batch = await prisma.ticket.findMany({
      where: cursorWhere,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: batchSize,
      select: TICKET_SELECT,
    });

    if (batch.length === 0) return;

    for (const ticket of batch) {
      yield toRow(ticket);
    }

    const last = batch[batch.length - 1];
    lastCreatedAt = last.createdAt;
    lastId = last.id;

    if (batch.length < batchSize) return;
  }
}

export type AttendeeFieldMeta = { label: string; key: string };

export async function loadAttendeeFields(eventIds: number[]) {
  if (eventIds.length === 0) return new Map<number, AttendeeFieldMeta[]>();

  const fields = await prisma.eventAttendeeField.findMany({
    where: { eventId: { in: eventIds } },
    select: { eventId: true, label: true, key: true, sortOrder: true },
    orderBy: [{ eventId: "asc" }, { sortOrder: "asc" }],
  });

  const map = new Map<number, AttendeeFieldMeta[]>();
  for (const field of fields) {
    const list = map.get(field.eventId) ?? [];
    list.push({ label: field.label, key: field.key });
    map.set(field.eventId, list);
  }
  return map;
}

const BASE_KEYS = new Set([
  "name",
  "email",
  "phone",
  "phoneNumber",
  "fullName",
]);

export function describeAttendeeData(
  data: Record<string, unknown>,
  fieldMap: AttendeeFieldMeta[] | undefined,
): { label: string; value: string; key: string }[] {
  const result: { label: string; value: string; key: string }[] = [];
  const seen = new Set<string>();

  for (const field of fieldMap ?? []) {
    if (seen.has(field.key)) continue;
    seen.add(field.key);
    const value = data[field.key];
    if (value === undefined || value === null || value === "") continue;
    result.push({
      label: field.label,
      value: formatValue(value),
      key: field.key,
    });
  }

  for (const [key, value] of Object.entries(data)) {
    if (seen.has(key) || BASE_KEYS.has(key)) continue;
    if (value === undefined || value === null || value === "") continue;
    result.push({ label: key, value: formatValue(value), key });
  }

  return result;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
