"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/FormatDate";

type AuditAction = "CREATE" | "UPDATE" | "DELETE";

type AuditLog = {
  id: number;
  actorId: number | null;
  actorName: string | null;
  actorRole: string | null;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
  createdAt: string;
};

const ACTION_BADGE: Record<AuditAction, string> = {
  CREATE: "bg-brand-mint-100 text-accent",
  UPDATE: "bg-brand-lavender-100 text-secondary",
  DELETE: "bg-destructive/10 text-destructive",
};

const PAGE_SIZES = [20, 50, 100];

const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "string" && ISO_DATE.test(value)) {
    return formatDateTime(value);
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

type DiffRow = { field: string; before: string; after: string };

function computeDiff(before: unknown, after: unknown): DiffRow[] {
  const b = asRecord(before);
  const a = asRecord(after);
  const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]));
  const rows: DiffRow[] = [];
  for (const key of keys) {
    const beforeValue = JSON.stringify(b[key] ?? null);
    const afterValue = JSON.stringify(a[key] ?? null);
    if (beforeValue !== afterValue) {
      rows.push({
        field: key,
        before: formatValue(b[key]),
        after: formatValue(a[key]),
      });
    }
  }
  return rows;
}

export default function AuditLogTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const [actorId, setActorId] = useState("");
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const params = new URLSearchParams();
  if (actorId) params.set("actorId", actorId);
  if (entity) params.set("entity", entity);
  if (action) params.set("action", action);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  const queryString = params.toString();

  const loading = loadedKey !== queryString;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/cadmin/audit-logs?${queryString}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setLogs(json.data ?? []);
        setTotal(json.total ?? 0);
        setEntities(json.entities ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load audit logs");
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(queryString);
      });
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  function resetFilters() {
    setActorId("");
    setEntity("");
    setAction("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Audit Logs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every change made by an admin or superadmin, with before/after values.
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Entity
          </span>
          <select
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All entities</option>
            {entities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Action
          </span>
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Actor ID
          </span>
          <input
            type="number"
            min={1}
            value={actorId}
            onChange={(e) => {
              setActorId(e.target.value);
              setPage(1);
            }}
            placeholder="Any"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            From
          </span>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Reset filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 text-right font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="h-8 animate-pulse rounded-lg bg-muted/60" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr className="border-t border-border">
                  <td
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                    colSpan={5}
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const diff = computeDiff(log.before, log.after);
                  const expanded = expandedId === log.id;
                  return (
                    <Fragment key={log.id}>
                      <tr className="border-t border-border align-top transition hover:bg-muted/40">
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {log.actorName ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.actorRole ?? "—"}
                            {log.actorId ? ` · #${log.actorId}` : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[11px] font-medium",
                              ACTION_BADGE[log.action],
                            )}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs text-foreground">
                            {log.entity}
                            {log.entityId ? `#${log.entityId}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {diff.length} field
                            {diff.length === 1 ? "" : "s"} changed
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(expanded ? null : log.id)
                            }
                            aria-expanded={expanded}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
                          >
                            {expanded ? "Hide" : "View"}
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform",
                                expanded && "rotate-180",
                              )}
                            />
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="border-t border-border bg-muted/30">
                          <td className="px-4 py-4" colSpan={5}>
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                                {log.ip && <span>IP: {log.ip}</span>}
                                {log.requestId && (
                                  <span>Request: {log.requestId}</span>
                                )}
                                {log.userAgent && (
                                  <span className="max-w-full truncate">
                                    UA: {log.userAgent}
                                  </span>
                                )}
                              </div>

                              {diff.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No field-level changes recorded.
                                </p>
                              ) : (
                                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-muted/50 uppercase tracking-wide text-muted-foreground">
                                      <tr>
                                        <th className="px-3 py-2 font-medium">
                                          Field
                                        </th>
                                        <th className="px-3 py-2 font-medium">
                                          Before
                                        </th>
                                        <th className="px-3 py-2 font-medium">
                                          After
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {diff.map((row) => (
                                        <tr
                                          key={row.field}
                                          className="border-t border-border"
                                        >
                                          <td className="px-3 py-2 font-mono text-foreground">
                                            {row.field}
                                          </td>
                                          <td className="max-w-xs px-3 py-2 wrap-break-words text-destructive">
                                            {row.before}
                                          </td>
                                          <td className="max-w-xs px-3 py-2 wrap-break-words text-accent">
                                            {row.after}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>
            {total.toLocaleString("id-ID")} entries · page {page} of{" "}
            {totalPages}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
