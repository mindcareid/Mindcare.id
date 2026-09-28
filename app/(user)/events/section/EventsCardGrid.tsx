import { CalendarDays, Clock, MapPin } from "lucide-react";

import EntityCard, {
  type EntityCardTag,
} from "@/app/components/reusable/EntityCard";

import EmptyState from "@/app/components/reusable/EmptyState";

import type { MetaItem } from "@/app/components/reusable/MetaRow";

import { cn } from "@/lib/utils";

import type { EventListItem } from "../data/events";

import {
  formatEventDate,
  formatEventStartTime,
} from "../data/eventTime";

function metaOf(
  event: EventListItem,
): MetaItem[] {
  return [
    {
      icon: CalendarDays,
      text: formatEventDate(event),
    },
    {
      icon: Clock,
      text: formatEventStartTime(event),
    },
    {
      icon: MapPin,
      text: event.location ?? "Online",
    },
  ];
}

function tagsOf(
  event: EventListItem,
): EntityCardTag[] {
  return [
    {
      label: event.category.name,
      tone: "mint",
    },

    ...event.focusAreas.map((area) => ({
      label: area.name,
      tone: "lavender" as const,
    })),
  ];
}

function footnoteOf(
  event: EventListItem,
): string {
  if (event.soldOut) {
    return "Sold out";
  }

  if (event.remaining !== null) {
    return `${event.remaining} ${
      event.remaining === 1
        ? "seat"
        : "seats"
    } left`;
  }

  return "Unlimited seats";
}

type EventsCardGridProps = {
  events: EventListItem[];
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
        description="Try another category or set When to All dates to see events that may already have passed."
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
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
          footnote={footnoteOf(event)}
          actionLabel="View Event"
          actionVariant="primary"
        />
      ))}
    </div>
  );
}