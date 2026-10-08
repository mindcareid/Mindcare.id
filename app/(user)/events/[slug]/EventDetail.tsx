import { Info } from "lucide-react";

import Container from "@/app/components/reusable/Container";
import { hasEnded } from "../data/eventTime";

import EventHero from "../section/EventHero";
import EventAbout from "../section/EventAbout";
import EventAgenda from "../section/EventAgenda";
import EventHostCard from "../section/EventHostCard";
import EventDetailRail from "../section/EventDetailRail";
import EventsCardGrid from "../section/EventsCardGrid";

import type {
  EventDetail as EventDetailData,
  EventListItem,
} from "../data/events";

type EventDetailProps = {
  event: EventDetailData;
  related: EventListItem[];
  now: string;
};

export default function EventDetail({
  event,
  related,
  now,
}: EventDetailProps) {
  const ended = hasEnded(event, now);

  return (
    <div className="min-h-screen">
      <EventHero event={event} now={now} />

      <Container className="pb-24">
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-16">
            <EventAbout event={event} />
            <EventAgenda event={event} />
            <EventHostCard event={event} />

            {ended ? (
              <div className="flex gap-3 rounded-xl border border-border bg-muted/30 p-5">
                <Info
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This event has ended. This page stays up as a record.
                </p>
              </div>
            ) : event.agenda.length > 0 ? (
              <div className="flex gap-3 rounded-xl border border-border bg-brand-mint-100/50 p-5">
                <Info
                  className="mt-0.5 size-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed text-foreground">
                  The agenda shown here is a plan rather than a fixed schedule.
                  The order and duration may change on the day.
                </p>
              </div>
            ) : null}
          </div>

          {/* Rail info */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <EventDetailRail event={event} now={now} />
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-events-title" className="mt-24">
            <h2
              id="related-events-title"
              className="font-heading text-2xl font-semibold text-foreground"
            >
              More events
            </h2>
            <EventsCardGrid
              events={related}
              now={now}
              className="mt-8"
            />
          </section>
        )}
      </Container>
    </div>
  );
}
