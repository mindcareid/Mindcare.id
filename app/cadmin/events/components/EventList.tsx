"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ListChecks,
  MapPin,
  Pencil,
  Search,
  Trash2,
  Users,
} from "lucide-react";
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

/**
 * Satu kartu event. Semua aksi dikumpulkan di footer kartu supaya tinggi
 * kartu seragam walau judulnya beda panjang.
 */
function EventCard({
  event,
  onTogglePublish,
  onDelete,
}: {
  event: Event;
  onTogglePublish: (event: Event) => void;
  onDelete: (event: Event) => void;
}) {
  const published = isPublished(event);

  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition hover:shadow-lg">
      {/* Cover */}
      <div className="relative aspect-video w-full shrink-0 bg-muted">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No cover
          </span>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge published={published} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 font-heading text-base font-semibold leading-snug text-foreground">
            {event.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {formatDate(event.startDate)}
          </span>
          {event.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {event.category?.name && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
              {event.category.name}
            </span>
          )}
          <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
            {event.price === 0 ? "Free" : formatIdr(event.price)}
          </span>
        </div>

        {/* Footer aksi — didorong ke bawah supaya sejajar antar kartu */}
        <div className="mt-auto space-y-2 pt-3">
          <Link
            href={`/cadmin/event-registrations?eventId=${event.id}`}
            className={buttonStyles({
              variant: "accent",
              size: "sm",
              className: "w-full",
            })}
          >
            <Users className="h-3.5 w-3.5" />
            Registrants
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/cadmin/events/edit/${event.id}`}
              className={buttonStyles({
                variant: "outline",
                size: "sm",
                className: "w-full",
              })}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
            <Link
              href={`/cadmin/events/${event.id}/attendee-fields`}
              className={buttonStyles({
                variant: "outline",
                size: "sm",
                className: "w-full",
              })}
            >
              <ListChecks className="h-3.5 w-3.5" />
              Fields
            </Link>
            <button
              type="button"
              onClick={() => onTogglePublish(event)}
              className={buttonStyles({
                variant: "outline",
                size: "sm",
                className: "w-full",
              })}
            >
              {published ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Publish
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onDelete(event)}
              className={buttonStyles({
                variant: "danger",
                size: "sm",
                className: "w-full",
              })}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

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
        event.category?.name?.toLowerCase().includes(q) ||
        event.location?.toLowerCase().includes(q),
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
            Manage events published on the public site, and see who registered.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSearch((prev) => !prev)}
            aria-expanded={showSearch}
            aria-label="Toggle search"
            className={buttonStyles({ variant: "ghost", size: "md" })}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            {showSearch ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          <Link
            href="/cadmin/events/create"
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Create event
          </Link>
        </div>
      </div>

      {/* Search — disembunyikan secara default supaya grid langsung terlihat */}
      {showSearch && (
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            autoFocus
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, or location..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-card">
          {events.length === 0
            ? "No events yet. Create your first event to get started."
            : "No events match your search."}
        </div>
      ) : (
        <>
          {/* Grid kartu: 1 kolom mobile, 2 tablet, 3 desktop */}
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onTogglePublish={handleTogglePublish}
                onDelete={handleDelete}
              />
            ))}
          </ul>

          <p className="mt-4 text-xs text-muted-foreground">
            {filtered.length} of {events.length} events
          </p>
        </>
      )}
    </div>
  );
}
