"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import { cn } from "@/lib/utils";

export type Event = {
  id: number;
  title: string;
  slug: string;
  location?: string | null;
  startDate: string;
  endDate: string;
  price: number;
  isPublished?: boolean;
  status?: string;
  coverImage?: string | null;
  category?: { id: number; name: string } | null;
};

function formatIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function isPublished(event: Event): boolean {
  return event.status
    ? event.status === "PUBLISHED"
    : Boolean(event.isPublished);
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        published
          ? "bg-brand-mint-100 text-accent"
          : "bg-muted text-muted-foreground",
      )}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function EventThumb({ event }: { event: Event }) {
  return event.coverImage ? (
    <Image
      src={event.coverImage}
      width={56}
      height={56}
      alt=""
      className="size-14 shrink-0 rounded-lg object-cover"
    />
  ) : (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
      N/A
    </span>
  );
}

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/cadmin/events")
      .then((res) => res.json())
      .then((data) => setEvents(data?.data || []))
      .catch(() => toast.error("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(q) ||
        event.category?.name?.toLowerCase().includes(q),
    );
  }, [events, search]);

  const handleDelete = async (event: Event) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const res = await fetch(`/api/cadmin/events/${event.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      toast.success("Event deleted");
      return;
    }
    const data = await res.json().catch(() => null);
    toast.error(data?.message || "Failed to delete event");
  };

  const handleTogglePublish = async (event: Event) => {
    const next = !isPublished(event);
    const res = await fetch(`/api/cadmin/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: next }),
    });
    if (res.ok) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, isPublished: next, status: next ? "PUBLISHED" : "DRAFT" }
            : e,
        ),
      );
      toast.success(next ? "Event published" : "Event moved to draft");
      return;
    }
    const data = await res.json().catch(() => null);
    toast.error(data?.message || "Failed to update event");
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Events
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage events published on the public site.
          </p>
        </div>
        <Link
          href="/cadmin/events/create"
          className={buttonStyles({ variant: "primary", size: "md" })}
        >
          Create event
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or category..."
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-card">
          No events found.
        </div>
      ) : (
        <>
          {/* ===== Mobile cards ===== */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex gap-3">
                  <EventThumb event={event} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {event.title}
                    </p>
                    {event.location && (
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {event.location}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(event.startDate)}
                      </span>
                      {event.category?.name && (
                        <span className="rounded-md bg-muted px-2 py-0.5">
                          {event.category.name}
                        </span>
                      )}
                      <StatusBadge published={isPublished(event)} />
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium text-foreground">
                  {event.price === 0 ? "Free" : formatIdr(event.price)}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href={`/cadmin/events/edit/${event.id}`}
                    className={buttonStyles({
                      variant: "outline",
                      size: "sm",
                      className: "w-full",
                    })}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/cadmin/events/${event.id}/attendee-fields`}
                    className={buttonStyles({
                      variant: "ghost",
                      size: "sm",
                      className: "w-full",
                    })}
                  >
                    Fields
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(event)}
                    className={buttonStyles({
                      variant: "ghost",
                      size: "sm",
                      className: "w-full",
                    })}
                  >
                    {isPublished(event) ? "Hide" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event)}
                    className={buttonStyles({
                      variant: "danger",
                      size: "sm",
                      className: "w-full",
                    })}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* ===== Desktop table ===== */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                      Category
                    </th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((event) => (
                    <tr
                      key={event.id}
                      className="border-t border-border transition hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <EventThumb event={event} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {event.title}
                            </p>
                            {event.location && (
                              <p className="truncate text-xs text-muted-foreground">
                                {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                        {event.category?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatDate(event.startDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {event.price === 0 ? "Free" : formatIdr(event.price)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge published={isPublished(event)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/cadmin/events/edit/${event.id}`}
                            className={buttonStyles({
                              variant: "outline",
                              size: "sm",
                            })}
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/cadmin/events/${event.id}/attendee-fields`}
                            className={buttonStyles({
                              variant: "ghost",
                              size: "sm",
                            })}
                          >
                            Fields
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(event)}
                            className={buttonStyles({
                              variant: "ghost",
                              size: "sm",
                            })}
                          >
                            {isPublished(event) ? "Hide" : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(event)}
                            className={buttonStyles({
                              variant: "danger",
                              size: "sm",
                            })}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length} of {events.length} events
          </p>
        </>
      )}
    </div>
  );
}
