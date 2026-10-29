"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { cn } from "@/lib/utils";
// Impor dari modul ".shared" saja. Modul `eventRegistrations` menarik
// `lib/prisma` (node:async_hooks) dan akan mematahkan bundel browser.
import {
  buildFilterParams,
  MAX_EXPORT_ROWS,
  STATUS_TABS,
  type OrderStatusFilter,
} from "@/lib/cadmin/eventRegistrations.shared";

type OrderStatus = OrderStatusFilter;

type RegistrationRow = {
  ticketId: string;
  code: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string | null;
  isCheckedIn: boolean;
  checkedAt: string | null;
  registeredAt: string;
  orderId: string;
  orderStatus: OrderStatus;
  orderAmount: number;
  paidAt: string | null;
  eventId: number;
  eventTitle: string;
  eventStartDate: string;
  buyer: { name: string; email: string } | null;
  customFields: { label: string; value: string }[];
};

type EventOption = {
  id: number;
  title: string;
  startDate: string;
  quota: number | null;
};

type Summary = {
  totalRegistrants: number;
  paidRegistrants: number;
  pendingRegistrants: number;
  checkedIn: number;
  revenue: number;
};

type Response = {
  data: RegistrationRow[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
  summary: Summary;
  events: EventOption[];
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  PAID: "bg-brand-mint-100 text-accent",
  PENDING: "bg-brand-lavender-100 text-secondary",
  EXPIRED: "bg-muted text-muted-foreground",
  CANCELED: "bg-destructive/10 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
};

const SEARCH_DEBOUNCE_MS = 350;

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/**
 * Tanggal event disimpan sebagai tengah malam zona event, jadi diformat dalam
 * UTC — sama seperti halaman Events dan Applications supaya harinya konsisten.
 */
function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-heading text-xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

export default function EventRegistrationsManager() {
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [meta, setMeta] = useState<Response["meta"] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Debounce: kotak input memakai `searchInput` (langsung responsif), tapi
  // request hanya memakai `search` yang baru diperbarui setelah admin berhenti
  // mengetik. Jadi mengetik "budi" = 1 request, bukan 4. Ini yang menjaga
  // server tidak dihujani query saat data pendaftar sudah besar nanti.
  //
  // PENTING: `onChange` di input search hanya boleh memanggil
  // `setSearchInput`. Kalau di situ juga memanggil `setSearch`, setiap huruf
  // memicu request dan debounce ini tidak berguna.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      // Reset ke halaman 1 bersamaan dengan perubahan filter, supaya tidak
      // ada request dengan page lama yang menyusul.
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset halaman di handler, bukan lewat effect: effect reset akan memicu
  // request dengan page lama lalu request kedua dengan page 1.
  const applyFilter = (change: () => void) => {
    change();
    setPage(1);
  };

  const activeFilters = {
    eventId: eventId ? Number(eventId) : undefined,
    status: status || undefined,
    search: search || undefined,
  };

  const queryString = buildFilterParams({
    ...activeFilters,
    page,
  }).toString();

  useEffect(() => {
    // Abort lebih awal supaya request yang sudah tidak relevan berhenti di
    // server, bukan cuma hasilnya dibuang di klien.
    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/cadmin/event-registrations?${queryString}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load");
        const payload = json as Response;
        setRows(payload.data ?? []);
        setMeta(payload.meta);
        setSummary(payload.summary);
        setEvents(payload.events ?? []);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        toast.error(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [queryString]);

  const downloadExcel = () => {
    // Unduhan lewat browser biasa, jadi filter ikut terbawa apa adanya.
    const params = buildFilterParams(activeFilters);
    window.location.href = `/api/cadmin/event-registrations/export-xlsx?${params.toString()}`;
  };

  const selectedEvent = events.find((e) => String(e.id) === eventId);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Event registrations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone who registered for a MindCare platform event, with their
            ticket, payment, and check-in status.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadExcel}
          disabled={loading || rows.length === 0}
          className={buttonStyles({ variant: "accent", size: "md" })}
        >
          <Download className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      {/* Ringkasan — mengikuti filter yang sama dengan tabel di bawah. */}
      {summary && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Registrants" value={summary.totalRegistrants.toLocaleString("id-ID")} />
          <StatCard label="Paid" value={summary.paidRegistrants.toLocaleString("id-ID")} />
          <StatCard label="Pending" value={summary.pendingRegistrants.toLocaleString("id-ID")} />
          <StatCard label="Checked in" value={summary.checkedIn.toLocaleString("id-ID")} />
          <StatCard label="Revenue (paid)" value={idr.format(summary.revenue)} />
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={eventId}
          onChange={(e) => {
            const value = e.target.value;
            applyFilter(() => setEventId(value));
          }}
          aria-label="Filter by event"
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
        >
          <option value="">All platform events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} · {formatDate(event.startDate)}
            </option>
          ))}
        </select>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or email..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value || "all"}
            type="button"
            onClick={() => applyFilter(() => setStatus(tab.value))}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              status === tab.value
                ? "bg-secondary text-secondary-foreground"
                : "border border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedEvent?.quota != null && summary && (
        <p className="mb-4 text-xs text-muted-foreground">
          {selectedEvent.title}: {summary.paidRegistrants + summary.pendingRegistrants} of{" "}
          {selectedEvent.quota} seats taken (paid + pending, current filters).
        </p>
      )}

      {/* Tabel */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-card">
          No registrations found.
        </div>
      ) : (
        <>
          {/* Mobile */}
          <ul className="space-y-3 md:hidden">
            {rows.map((row) => {
              const expanded = expandedId === row.ticketId;
              return (
                <li
                  key={row.ticketId}
                  className="rounded-xl border border-border bg-card p-4 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {row.attendeeName || "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.attendeeEmail}
                      </p>
                      {row.attendeePhone && (
                        <p className="truncate text-xs text-muted-foreground">
                          {row.attendeePhone}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium",
                        STATUS_BADGE[row.orderStatus],
                      )}
                    >
                      {row.orderStatus}
                    </span>
                  </div>

                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    {row.eventTitle}
                  </p>

                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : row.ticketId)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary"
                    aria-expanded={expanded}
                  >
                    {expanded ? "Hide details" : "View details"}
                    {expanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {expanded && <RegistrationDetail row={row} />}
                </li>
              );
            })}
          </ul>

          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Registrant</th>
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                      Event
                    </th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="hidden px-4 py-3 font-medium xl:table-cell">
                      Registered
                    </th>
                    <th className="px-4 py-3 font-medium">Check-in</th>
                    <th className="px-4 py-3 text-right font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const expanded = expandedId === row.ticketId;
                    return [
                      <tr
                        key={row.ticketId}
                        className={cn(
                          "border-t border-border transition hover:bg-muted/40",
                          expanded && "bg-muted/30",
                        )}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {row.attendeeName || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {row.attendeeEmail}
                          </p>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          <p className="max-w-[16rem] truncate text-muted-foreground">
                            {row.eventTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(row.eventStartDate)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium",
                              STATUS_BADGE[row.orderStatus],
                            )}
                          >
                            {row.orderStatus}
                          </span>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {idr.format(row.orderAmount)}
                          </p>
                        </td>
                        <td className="hidden px-4 py-3 whitespace-nowrap text-muted-foreground xl:table-cell">
                          {formatDateTime(row.registeredAt)}
                        </td>
                        <td className="px-4 py-3">
                          {row.isCheckedIn ? (
                            <span className="inline-flex rounded-md bg-brand-mint-100 px-2 py-0.5 text-[11px] font-medium text-accent">
                              Checked in
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Not yet
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(expanded ? null : row.ticketId)
                            }
                            aria-expanded={expanded}
                            aria-label={expanded ? "Hide details" : "Show details"}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                          >
                            {expanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>,
                      ...(expanded
                        ? [
                            <tr key={`${row.ticketId}-detail`} className="bg-muted/20">
                              <td colSpan={6} className="px-4 py-5">
                                <RegistrationDetail row={row} />
                              </td>
                            </tr>,
                          ]
                        : []),
                    ];
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Page {meta.page} of {meta.totalPages} · {meta.total.toLocaleString("id-ID")} registrants
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1 || loading}
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={meta.page >= meta.totalPages || loading}
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {meta && meta.total > meta.pageSize && (
            <p className="mt-3 text-xs text-muted-foreground">
              {rows.length} shown · CSV export includes all{" "}
              {meta.total.toLocaleString("id-ID")} matching registrants.
              {meta.total > MAX_EXPORT_ROWS
                ? ` Exports are capped at ${MAX_EXPORT_ROWS.toLocaleString("id-ID")} rows — narrow the filters to export.`
                : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function RegistrationDetail({ row }: { row: RegistrationRow }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <DetailRow label="Ticket code" value={row.code} />
      <DetailRow
        label="Order"
        value={`${row.orderId} · ${row.orderStatus}`}
      />
      <DetailRow label="Amount" value={idr.format(row.orderAmount)} />
      <DetailRow label="Paid at" value={formatDateTime(row.paidAt)} />
      <DetailRow label="Registered at" value={formatDateTime(row.registeredAt)} />
      <DetailRow
        label="Checked in at"
        value={formatDateTime(row.checkedAt)}
      />
      <DetailRow label="Event" value={row.eventTitle} />
      <DetailRow label="Event date" value={formatDate(row.eventStartDate)} />
      <DetailRow label="Phone" value={row.attendeePhone ?? "—"} />
      <DetailRow
        label="Purchaser / account"
        value={row.buyer ? `${row.buyer.name} (${row.buyer.email})` : "—"}
      />

      {row.customFields.length > 0 && (
        <div className="sm:col-span-2 lg:col-span-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Registration answers
          </p>
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
            {row.customFields.map((field) => (
              <DetailRow
                key={field.label}
                label={field.label}
                value={field.value}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
