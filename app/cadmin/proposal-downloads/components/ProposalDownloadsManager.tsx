"use client";

import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";

import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import {
  buildFilterParams,
  MAX_EXPORT_ROWS,
} from "@/lib/cadmin/proposalDownloads.shared";

type DownloadRow = {
  id: number;
  eventId: number;
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string | null;
  position: string | null;
  source: "ATTACHED" | "GENERATED";
  documentWarning: string | null;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  emailSentAt: string | null;
  emailError: string | null;
  createdAt: string;
  event: { title: string; startDate: string };
};

type EventOption = {
  id: number;
  title: string;
  startDate: string;
};

type Response = {
  data: DownloadRow[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
  events: EventOption[];
};

const SEARCH_DEBOUNCE_MS = 350;

function formatDate(value: string): string {
  // Tanggal event disimpan sebagai tengah malam zona event, jadi diformat
  // dalam UTC seperti halaman Events dan Event Registrations.
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

export default function ProposalDownloadsManager({
  initialEventId = "",
}: {
  initialEventId?: string;
}) {
  const [eventId, setEventId] = useState(initialEventId);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<DownloadRow[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [meta, setMeta] = useState<Response["meta"] | null>(null);
  // Kunci query yang datanya sudah diterima. Skeleton dihitung dari
  // perbandingan ini, bukan dari flag boolean di dalam effect: flag toggle
  // tidak sempat berjalan sebelum render pertama, sehingga baris lama masih
  // tampil (dan tombol export masih aktif) saat filter berubah.
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const applyFilter = (change: () => void) => {
    change();
    setPage(1);
  };

  const activeFilters = {
    eventId: eventId ? Number(eventId) : undefined,
    search: search || undefined,
  };

  const queryString = buildFilterParams({
    ...activeFilters,
    page,
  }).toString();

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/cadmin/proposal-downloads?${queryString}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load");
        const payload = json as Response;
        setRows(payload.data ?? []);
        setMeta(payload.meta);
        setEvents(payload.events ?? []);
        setLoadedQuery(queryString);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        toast.error(err instanceof Error ? err.message : "Failed to load");
        // Tandai query ini selesai supaya skeleton tidak berputar terus dan
        // admin bisa memperbaiki filter alih-alih menunggu tanpa akhir.
        setLoadedQuery(queryString);
      });

    return () => controller.abort();
  }, [queryString]);

  const loading = loadedQuery !== queryString;

  const downloadExcel = () => {
    const params = buildFilterParams(activeFilters);
    window.location.href = `/api/cadmin/proposal-downloads/export-xlsx?${params.toString()}`;
  };

  const selectedEvent = events.find((e) => String(e.id) === eventId);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {selectedEvent
              ? `Proposal downloads · ${selectedEvent.title}`
              : "Proposal downloads"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone who filled in the form to download an event proposal. Each
            row received the PDF by email.
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
            placeholder="Search name, email, or institution..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

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
          No proposal downloads yet.
        </div>
      ) : (
        <>
          {/* Mobile */}
          <ul className="space-y-3 md:hidden">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {row.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.phone}
                    </p>
                  </div>
                  <EmailBadge row={row} />
                </div>
                <p className="mt-2 truncate text-xs text-muted-foreground">
                  {row.event.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[row.institution, row.position].filter(Boolean).join(" · ") ||
                    "—"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDateTime(row.createdAt)}
                </p>
                {row.documentWarning && (
                  <p className="mt-1 text-[11px] font-medium text-destructive">
                    Fallback — file asli gagal dipakai
                  </p>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Institution</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Proposal status</th>
                    <th className="px-4 py-3">Requested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {row.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.eventName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{row.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {row.institution ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {row.position ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{row.event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.source === "GENERATED"
                            ? "Auto-generated summary"
                            : "Uploaded file"}
                        </p>
                        {/* File proposal asli gagal dipakai: yang terkirim ke
                            pengunduh adalah ringkasan, bukan file asli. */}
                        {row.documentWarning && (
                          <p
                            title={row.documentWarning}
                            className="mt-1 inline-flex rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive"
                          >
                            Fallback — file asli gagal dipakai
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <EmailBadge row={row} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatDateTime(row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {meta && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ·{" "}
                {meta.total.toLocaleString("id-ID")} downloads
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
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
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
              {rows.length} shown · Excel export includes all{" "}
              {meta.total.toLocaleString("id-ID")} matching downloads.
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

/**
 * Status pengiriman email proposal (alur satu langkah):
 *   Sent    -> PDF berhasil dikirim ke email pengunduh
 *   Pending -> lead tercatat, email masih diproses
 *   Failed  -> pengiriman gagal, alasan ada di `emailError`
 */
function EmailBadge({ row }: { row: DownloadRow }) {
  if (row.status === "CONFIRMED") {
    return (
      <span
        title={row.emailSentAt ? formatDateTime(row.emailSentAt) : undefined}
        className="inline-flex shrink-0 rounded-md bg-brand-mint-100 px-2 py-0.5 text-[11px] font-medium text-accent"
      >
        Sent
      </span>
    );
  }

  if (row.status === "FAILED") {
    return (
      <span
        title={row.emailError ?? undefined}
        className="inline-flex shrink-0 rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive"
      >
        Failed
      </span>
    );
  }

  return (
    <span
      title="Email with the proposal is still being processed"
      className="inline-flex shrink-0 rounded-md bg-brand-lavender-100 px-2 py-0.5 text-[11px] font-medium text-secondary"
    >
      Pending
    </span>
  );
}
