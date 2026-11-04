"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  Check,
  Download,
  Mail,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Button from "@/app/components/reusable/Button";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { cn } from "@/lib/utils";
import { priceLines } from "@/lib/sponsors/money";
import {
  SPONSOR_PAGE_SIZE,
  SPONSOR_STATUS_LABEL,
  SPONSOR_STATUSES,
  buildSponsorFilterParams,
  type SponsorStatus,
} from "@/lib/sponsors/shared";

type Row = {
  id: number;
  referenceNo: string;
  status: SponsorStatus;
  companyName: string;
  countryCode: string;
  picFirstName: string;
  picLastName: string;
  picTitle: string | null;
  picEmail: string;
  picPhone: string;
  priceAmountSnapshot: number;
  currencySnapshot: string;
  displayUsdSnapshot: number | null;
  createdAt: string;
  emailSentAt: string | null;
  event: { id: number; title: string; slug: string };
  tier: { id: number; name: string; isActive: boolean };
};

type EventOption = { id: number; title: string; startDate: string };

type Detail = Row & {
  address: string;
  website: string | null;
  companyEmail: string | null;
  picPosition: string;
  notes: string | null;
  emailError: string | null;
  countryName: string;
  updatedAt: string;
  /**
   * Benefit yang disetujui saat pengajuan dibuat. Sebelum ada kolom snapshot,
   * API mengisinya dari paket berjalan dan menandai `benefitsAreSnapshot`.
   */
  agreedBenefits: { title: string; detail?: string }[];
  benefitsAreSnapshot: boolean;
  tier: {
    id: number;
    name: string;
    isActive: boolean;
    priceAmount: number;
    benefits: { title: string; detail?: string }[];
  };
};

type Summary = {
  pending: number;
  reviewed: number;
  archived: number;
  total: number;
};

const STATUS_STYLE: Record<SponsorStatus, string> = {
  PENDING: "bg-brand-lavender-100 text-secondary",
  REVIEWED: "bg-brand-mint-200 text-accent",
  ARCHIVED: "bg-muted text-muted-foreground",
};

const selectClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function picName(row: {
  picTitle: string | null;
  picFirstName: string;
  picLastName: string;
}) {
  return [row.picTitle, row.picFirstName, row.picLastName]
    .filter(Boolean)
    .join(" ");
}

export default function SponsorApplicationsManager({
  initialEventId,
}: {
  initialEventId: string;
}) {
  const [eventId, setEventId] = useState(initialEventId);
  const [status, setStatus] = useState<"" | SponsorStatus>("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<Row[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Debounce hanya untuk ketikan. Filter event/status adalah klik, jadi
  // langsung dipakai — kalau search ikut dipicu di onChange, debounce-nya
  // tidak ada gunanya.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const filters = useMemo(
    () =>
      buildSponsorFilterParams({
        eventId: eventId ? Number(eventId) : undefined,
        status: status || undefined,
        search: search || undefined,
        page,
      }),
    [eventId, status, search, page],
  );

  const reloadKey = filters.toString();

  const load = useCallback(
    async (active: { current: boolean }) => {
      // `await` sebelum setState pertama: flag aktif dibaca setelahnya.
      const res = await fetch(`/api/cadmin/sponsor-applications?${reloadKey}`, {
        cache: "no-store",
      }).catch((caught: unknown) => {
        if (active.current) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load applications",
          );
          setLoading(false);
        }
        return null;
      });

      if (!res || !active.current) return;

      try {
        const json = await res.json();
        if (!res.ok)
          throw new Error(json.message || "Could not load applications");
        if (!active.current) return;

        setRows(json.data ?? []);
        setEvents(json.events ?? []);
        setSummary(json.summary ?? null);
        setMeta({
          total: json.meta?.total ?? 0,
          totalPages: json.meta?.totalPages ?? 1,
        });
        setError(null);
        setLoading(false);
      } catch (caught) {
        if (!active.current) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load applications",
        );
        setLoading(false);
      }
    },
    [reloadKey],
  );

  useEffect(() => {
    // setState hanya terjadi setelah await di dalam `load`. Pemanggilan
    // dibungkus arrow function supaya aturan react-hooks/set-state-in-effect
    // tidak menganggapnya setState sinkron di badan efek.
    const active = { current: true };
    const run = () => {
      void load(active);
    };
    run();
    return () => {
      active.current = false;
    };
  }, [load]);

  async function openDetail(id: number) {
    setSelected(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/cadmin/sponsor-applications/${id}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "Could not load the application");
      setDetail(json.data);
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Could not load the application",
      );
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function setStatusFor(id: number, next: SponsorStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/cadmin/sponsor-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json.message || "Could not update the status");

      setRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, status: next } : row)),
      );
      setDetail((prev) =>
        prev && prev.id === id ? { ...prev, status: next } : prev,
      );
      toast.success(`Marked as ${SPONSOR_STATUS_LABEL[next].toLowerCase()}`);
      void load({ current: true });
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Could not update the status",
      );
    } finally {
      setUpdating(false);
    }
  }

  function exportHref(): string {
    const params = buildSponsorFilterParams({
      eventId: eventId ? Number(eventId) : undefined,
      status: status || undefined,
      search: search || undefined,
    });
    const query = params.toString();
    return `/api/cadmin/sponsor-applications/export-xlsx${query ? `?${query}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-4 sm:flex sm:flex-wrap sm:items-start sm:justify-between sm:gap-4 sm:space-y-0">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
              Sponsorship
            </p>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Applications
            </h1>
            <p className="text-sm text-muted-foreground">
              Requests received from companies. Invoice and payment are handled
              by the sponsorship team outside MindCare.
            </p>
          </div>

          {/*
            Di mobile dua tombol berbagi satu baris penuh, bukan menggantung.
            Kelas tambahan dikirim lewat prop `className` milik buttonStyles,
            bukan dibungkus `cn(...)`: `cn(buttonStyles({...}), "...")` membuat
            pemeriksa kelas Tailwind memotong string di `)` pertama dan
            membaca `secondary` sebagai kelas CSS.
          */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/cadmin/events"
              className={buttonStyles({
                variant: "outline",
                className: "justify-center",
              })}
            >
              <ArrowLeft className="h-4 w-4" />
              Events
            </Link>
            <a
              href={exportHref()}
              className={buttonStyles({
                variant: "secondary",
                className: "justify-center",
              })}
              download
            >
              <Download className="h-4 w-4" />
              Export Excel
            </a>
          </div>
        </header>

        {summary ? (
          <div className="space-y-2">
            {/*
              Kartu ringkasan sengaja TIDAK mengikuti filter status. Tanpa
              keterangan ini, angka kartu tampak bertentangan dengan "Total N"
              pada tabel yang sedang terfilter.
            */}
            {status ? (
              <p className="text-xs text-muted-foreground">
                Counts below cover every status; the table is filtered to one.
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="New" value={summary.pending} />
              <SummaryCard label="Reviewed" value={summary.reviewed} />
              <SummaryCard label="Archived" value={summary.archived} />
              <SummaryCard label="Total" value={summary.total} />
            </div>
          </div>
        ) : null}

        <section className="space-y-4 rounded-xl border border-border bg-card p-4">
            {/* 2 kolom di ponsel: Event & Status berdampingan, pencarian lebar penuh. */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <label className="col-span-2 space-y-1.5 md:col-span-1">
                <span className="block text-xs font-medium text-muted-foreground">
                  Event
                </span>
                <select
                  className={selectClass}
                  value={eventId}
                  onChange={(event) => {
                    setEventId(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All events</option>
                  {events.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="block text-xs font-medium text-muted-foreground">
                  Status
                </span>
                <select
                  className={selectClass}
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as "" | SponsorStatus);
                    setPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  {SPONSOR_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {SPONSOR_STATUS_LABEL[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="col-span-2 space-y-1.5 md:col-span-1">
                <span className="block text-xs font-medium text-muted-foreground">
                  Search
                </span>
                <span className="relative block">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    className={cn(selectClass, "pl-9")}
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Company, reference, email…"
                    aria-label="Search applications"
                  />
                </span>
              </label>
            </div>

          {error ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {/*
            Mobile: daftar kartu. Tabel 9 kolom tidak mungkin dibaca di layar
            ponsel — sebelumnya admin harus menggeser ke samping dan kehilangan
            konteks baris. Di md ke atas, tabelnya tetap seperti semula.
          */}
          <ul className="space-y-3 md:hidden">
            {loading ? (
              <li className="py-10 text-center text-sm text-muted-foreground">
                Loading applications…
              </li>
            ) : rows.length === 0 ? (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No applications yet.
              </li>
            ) : (
              rows.map((row) => {
                const price = priceLines({
                  amount: row.priceAmountSnapshot,
                  currency: row.currencySnapshot,
                  displayUsd: row.displayUsdSnapshot,
                });

                return (
                  <li
                    key={row.id}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => void openDetail(row.id)}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {row.referenceNo}
                        </button>
                        <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
                          {row.companyName}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                          STATUS_STYLE[row.status],
                        )}
                      >
                        {SPONSOR_STATUS_LABEL[row.status]}
                      </span>
                    </div>

                    <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
                      <div className="flex justify-between gap-3">
                        <dt className="shrink-0 text-muted-foreground">Event</dt>
                        <dd className="min-w-0 text-right text-foreground">
                          {row.event.title}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="shrink-0 text-muted-foreground">
                          Package
                        </dt>
                        <dd className="min-w-0 text-right text-foreground">
                          {row.tier.name} · {price.primary}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="shrink-0 text-muted-foreground">
                          Contact
                        </dt>
                        <dd className="min-w-0 break-all text-right text-foreground">
                          {picName(row)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="shrink-0 text-muted-foreground">
                          Country
                        </dt>
                        <dd className="text-right text-foreground">
                          {row.countryCode}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="shrink-0 text-muted-foreground">
                          Received
                        </dt>
                        <dd className="text-right text-foreground">
                          {formatDateTime(row.createdAt)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                      <button
                        type="button"
                        onClick={() => void openDetail(row.id)}
                        className="rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
                      >
                        View
                      </button>
                      <StatusActions
                        status={row.status}
                        updating={updating}
                        onStatus={(next) => void setStatusFor(row.id, next)}
                      />
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          {/* Desktop: tabel penuh */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-260 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Reference</th>
                  <th className="py-2 pr-3 font-medium">Event</th>
                  <th className="py-2 pr-3 font-medium">Company</th>
                  <th className="py-2 pr-3 font-medium">Package</th>
                  <th className="py-2 pr-3 font-medium">Contact person</th>
                  <th className="py-2 pr-3 font-medium">Country</th>
                  <th className="py-2 pr-3 font-medium">Received</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Loading applications…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No applications yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => void openDetail(row.id)}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {row.referenceNo}
                        </button>
                      </td>
                      <td className="max-w-55 py-3 pr-3">
                        <p className="truncate font-medium text-foreground">
                          {row.event.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.companyName}
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-foreground">
                          {row.tier.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {
                            priceLines({
                              amount: row.priceAmountSnapshot,
                              currency: row.currencySnapshot,
                              displayUsd: row.displayUsdSnapshot,
                            }).primary
                          }
                        </p>
                      </td>
                      <td className="max-w-50 py-3 pr-3">
                        <p className="truncate text-foreground">
                          {picName(row)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.picEmail}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">
                        {row.countryCode}
                      </td>
                      <td className="py-3 pr-3 text-xs text-muted-foreground">
                        {formatDateTime(row.createdAt)}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                            STATUS_STYLE[row.status],
                          )}
                        >
                          {SPONSOR_STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => void openDetail(row.id)}
                            className="rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-muted"
                          >
                            View
                          </button>
                          {/*
                            Aksi status ada di satu komponen supaya kartu
                            mobile dan tabel desktop tidak bisa berbeda
                            perilaku. Aturannya: PENDING → Review,
                            REVIEWED → Archive, ARCHIVED → Restore
                            (dengan konfirmasi).
                          */}
                          <StatusActions
                            status={row.status}
                            updating={updating}
                            onStatus={(next) => void setStatusFor(row.id, next)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <span>
              {meta.total} application{meta.total === 1 ? "" : "s"} · page{" "}
              {page} of {meta.totalPages} · {SPONSOR_PAGE_SIZE} per page
            </span>
            {/* Tombol selebar layar di ponsel: mudah ditekan, tidak berdempetan. */}
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-2 text-center transition-colors hover:bg-muted disabled:opacity-40 sm:py-1.5"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1 || loading}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-md border border-border px-3 py-2 text-center transition-colors hover:bg-muted disabled:opacity-40 sm:py-1.5"
                onClick={() =>
                  setPage((value) => Math.min(meta.totalPages, value + 1))
                }
                disabled={page >= meta.totalPages || loading}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      {selected !== null ? (
        <DetailPanel
          loading={detailLoading}
          detail={detail}
          updating={updating}
          onClose={() => {
            setSelected(null);
            setDetail(null);
          }}
          onStatus={(next) => detail && void setStatusFor(detail.id, next)}
        />
      ) : null}
    </div>
  );
}

/**
 * Aksi perubahan status, dipakai kartu mobile dan tabel desktop.
 *
 * Satu status hanya menawarkan satu langkah maju yang jelas:
 * PENDING → REVIEWED ("Review"), REVIEWED → ARCHIVED ("Archive"),
 * ARCHIVED → PENDING ("Restore", dengan konfirmasi). Tombol "Review" tidak
 * pernah muncul di baris arsip, sehingga arsip tidak bisa terbalik karena
 * salah klik.
 */
function StatusActions({
  status,
  updating,
  onStatus,
}: {
  status: SponsorStatus;
  updating: boolean;
  onStatus: (next: SponsorStatus) => void;
}) {
  if (status === "PENDING") {
    return (
      <button
        type="button"
        onClick={() => onStatus("REVIEWED")}
        disabled={updating}
        className="rounded-md border border-border px-2 py-1 text-xs text-accent transition-colors hover:bg-brand-mint-100 disabled:opacity-50"
      >
        Review
      </button>
    );
  }

  if (status === "REVIEWED") {
    return (
      <button
        type="button"
        onClick={() => onStatus("ARCHIVED")}
        disabled={updating}
        className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        Archive
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (
          !window.confirm(
            "Restore this application to New? It will appear as an unhandled request again.",
          )
        ) {
          return;
        }
        onStatus("PENDING");
      }}
      disabled={updating}
      className="rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-50"
    >
      Restore
    </button>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-heading text-2xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function DetailPanel({
  loading,
  detail,
  updating,
  onClose,
  onStatus,
}: {
  loading: boolean;
  detail: Detail | null;
  updating: boolean;
  onClose: () => void;
  onStatus: (status: SponsorStatus) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sponsor application detail"
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-card shadow-lg"
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-border bg-card px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
              {SPONSOR_STATUS_LABEL[detail?.status ?? "PENDING"]}
            </p>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {detail?.referenceNo ?? "Loading…"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <p className="px-5 py-10 text-sm text-muted-foreground">Loading…</p>
        ) : detail ? (
          <div className="space-y-6 px-5 py-5">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Field label="Event">{detail.event.title}</Field>
              <Field label="Package">{detail.tier.name}</Field>
              <Field label="Price">
                {
                  priceLines({
                    amount: detail.priceAmountSnapshot,
                    currency: detail.currencySnapshot,
                    displayUsd: detail.displayUsdSnapshot,
                  }).primary
                }
                {detail.displayUsdSnapshot ? (
                  <span className="ml-1 text-muted-foreground">
                    (
                    {
                      priceLines({
                        amount: detail.priceAmountSnapshot,
                        currency: detail.currencySnapshot,
                        displayUsd: detail.displayUsdSnapshot,
                      }).secondary
                    }{" "}
                    estimate)
                  </span>
                ) : null}
              </Field>
              <Field label="Received">{formatDateTime(detail.createdAt)}</Field>
            </dl>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <Field label="Name">{detail.companyName}</Field>
                <Field label="Country">{detail.countryName}</Field>
                <Field label="Address" wide>
                  {detail.address}
                </Field>
                <Field label="Website">
                  {detail.website ? (
                    <a
                      href={detail.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary hover:underline"
                    >
                      {detail.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </Field>
                <Field label="Company email">
                  {detail.companyEmail ? (
                    <a
                      href={`mailto:${detail.companyEmail}`}
                      className="text-primary hover:underline"
                    >
                      {detail.companyEmail}
                    </a>
                  ) : (
                    "—"
                  )}
                </Field>
              </dl>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Contact person
              </h3>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <Field label="Name">{picName(detail)}</Field>
                <Field label="Position">{detail.picPosition}</Field>
                <Field label="Phone">{detail.picPhone}</Field>
                <Field label="Email">
                  <a
                    href={`mailto:${detail.picEmail}`}
                    className="text-primary hover:underline"
                  >
                    {detail.picEmail}
                  </a>
                </Field>
              </dl>
            </div>

            {detail.agreedBenefits.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Package included
                </h3>
                <p className="text-xs text-muted-foreground">
                  {detail.benefitsAreSnapshot
                    ? "As requested by this applicant — the package may have been edited since."
                    : "From the current package (this request predates benefit snapshots)."}
                </p>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {detail.agreedBenefits.map((benefit, index) => (
                    <li
                      key={`${benefit.title}-${index}`}
                      className="text-sm text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">
                        {benefit.title}
                      </span>
                      {benefit.detail ? ` — ${benefit.detail}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Note to organizer
              </h3>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {detail.notes ?? "—"}
              </p>
            </div>

            <div className="space-y-1 rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {detail.emailSentAt
                  ? `Confirmation emailed ${formatDateTime(detail.emailSentAt)}`
                  : "Confirmation email not sent yet"}
              </p>
              {detail.emailError ? (
                <p className="text-destructive">
                  Email error: {detail.emailError}
                </p>
              ) : null}
            </div>

            {/*
              Di ponsel tombol aksi ditumpuk selebar panel (mudah ditekan dan
              tidak terpotong); di layar lebar tetap berjajar.
            */}
            <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap">
              <Button
                variant="accent"
                icon={Check}
                isLoading={updating}
                onClick={() => onStatus("REVIEWED")}
                disabled={detail.status === "REVIEWED"}
                className="w-full justify-center sm:w-auto"
              >
                Mark reviewed
              </Button>
              <Button
                variant="outline"
                icon={Archive}
                onClick={() => onStatus("ARCHIVED")}
                disabled={updating || detail.status === "ARCHIVED"}
                className="w-full justify-center sm:w-auto"
              >
                Archive
              </Button>
              {detail.status !== "PENDING" ? (
                <Button
                  variant="ghost"
                  onClick={() => onStatus("PENDING")}
                  disabled={updating}
                  className="w-full justify-center sm:w-auto"
                >
                  Back to new
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}
