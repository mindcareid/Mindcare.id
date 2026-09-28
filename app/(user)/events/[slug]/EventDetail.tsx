import { Info } from "lucide-react";

import Container from "@/app/components/reusable/Container";
import SectionHeader from "@/app/components/reusable/SectionHeader";

import { hasEnded } from "../data/eventTime";

import EventAbout from "../section/EventAbout";
import EventAgenda from "../section/EventAgenda";
import EventHero from "../section/EventHero";
import EventHostCard from "../section/EventHostCard";
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
      <EventHero
        event={event}
        now={now}
      />

      <Container className="pb-16 md:pb-24">
        <div className="space-y-14 md:space-y-16">
          <EventAbout event={event} />

          <EventAgenda event={event} />

          <EventHostCard
            event={event}
          />

          <div className="flex max-w-prose gap-3 rounded-xl border border-border bg-brand-mint-100 p-5">
            <Info
              className="mt-0.5 size-5 shrink-0 text-accent"
              aria-hidden="true"
            />

            <p className="text-sm leading-relaxed text-foreground">
              {ended
                ? "This event has ended. This page remains available as a record. If you would like to join a similar upcoming event, please contact us."
                : "The agenda shown on this page is a plan rather than a fixed schedule. The order and duration may change on the day of the event. Seat availability is updated manually, so please confirm availability when contacting us."}
            </p>
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related-events-title">
              <SectionHeader
                title="More events"
                href="/events"
                underline
              />

              <EventsCardGrid
                events={related}
                now={now}
                className="mt-6"
              />
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}