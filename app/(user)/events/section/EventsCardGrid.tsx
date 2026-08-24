import { CalendarDays, Clock, MapPin } from "lucide-react";
import EntityCard, {
  type EntityCardTag,
} from "@/app/components/reusable/EntityCard";
import EmptyState from "@/app/components/reusable/EmptyState";
import type { MetaItem } from "@/app/components/reusable/MetaRow";
import { cn } from "@/lib/utils";
import type { MindcareEvent } from "../type/event";
import { hasEnded } from "../data/eventTime";

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type EventFormatters = {
  date: Intl.DateTimeFormat;
  time: Intl.DateTimeFormat;
  zone: Intl.DateTimeFormat;
};

const formatterCache = new Map<string, EventFormatters>();

function formattersFor(timeZone: string): EventFormatters {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;

  const formatters: EventFormatters = {
    date: new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone,
    }),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }),
    zone: new Intl.DateTimeFormat("id-ID", {
      timeZoneName: "short",
      timeZone,
    }),
  };

  formatterCache.set(timeZone, formatters);
  return formatters;
}

function zoneLabelOf(formatters: EventFormatters, date: Date) {
  return (
    formatters.zone
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
}

function metaOf(event: MindcareEvent): MetaItem[] {
  const start = new Date(event.startDate);
  const formatters = formattersFor(event.timeZone);
  const zone = zoneLabelOf(formatters, start);
  const time = formatters.time.format(start);

  return [
    { icon: CalendarDays, text: formatters.date.format(start) },
    { icon: Clock, text: zone === "" ? time : `${time} ${zone}` },
    { icon: MapPin, text: event.location ?? "Online" },
  ];
}

function tagsOf(event: MindcareEvent): EntityCardTag[] {
  return [
    { label: event.category.name, tone: "mint" },
    ...event.focusAreas.map((area) => ({
      label: area.name,
      tone: "lavender" as const,
    })),
  ];
}

function footnoteOf(event: MindcareEvent, now: string) {
  if (hasEnded(event, now)) return "Event has ended";

  const remaining =
    event.quota === null ? null : event.quota - event.registeredCount;

  if (remaining !== null && remaining <= 0) return "Sold out";

  const price = event.price === 0 ? "Free" : priceFormatter.format(event.price);

  if (remaining === null) return price;

  return `${price} · ${remaining} ${remaining === 1 ? "seat" : "seats"} left`;
}

type EventsCardGridProps = {
  events: MindcareEvent[];
  now: string;
  emptyAction?: React.ReactNode;
  className?: string;
};

export default function EventsCardGrid({
  events,
  now,
  emptyAction,
  className,
}: EventsCardGridProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No events match your filters"
        description="Try another category or set When to All dates some events may already have passed."
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {events.map((event) => (
        <EntityCard
          key={event.id}
          href={`/events/${event.slug}`}
          title={event.title}
          subtitle={`Hosted by ${event.host.name}`}
          imageUrl={event.coverImage}
          imageAlt={event.title}
          tags={tagsOf(event)}
          maxTags={3}
          meta={metaOf(event)}
          footnote={footnoteOf(event, now)}
          actionLabel="View Event"
          actionVariant="primary"
        />
      ))}
    </div>
  );
}
