import { CalendarDays, Clock, MapPin, Video } from "lucide-react";

import Container from "@/app/components/reusable/Container";
import MetaRow from "@/app/components/reusable/MetaRow";
import Tag from "@/app/components/reusable/Tag";

import { formatEventDateLong, formatEventTimeRange } from "../data/eventTime";

import type { EventDetail } from "../data/events";
import Image from "next/image";

type EventHeroProps = {
  event: EventDetail;
  now: string;
};

export default function EventHero({ event, now }: EventHeroProps) {
  const hasCover = Boolean(event.coverImage);

  return (
    <section className="border-b border-border bg-card">
      <Container className="py-10 md:py-14">
        <div
          className={
            hasCover
              ? "grid items-start gap-10 md:grid-cols-[1fr_400px] md:gap-12"
              : ""
          }
        >
          <div className={hasCover ? "" : "max-w-3xl"}>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="mint">{event.category.name}</Tag>
              <Tag tone="lavender">{event.format}</Tag>
            </div>

            <h1 className="mt-4 font-heading text-[28px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground md:text-[36px] lg:text-[42px]">
              {event.title}
            </h1>

            <MetaRow
              className="mt-6"
              items={[
                {
                  icon: CalendarDays,
                  text: formatEventDateLong(event),
                },
                {
                  icon: Clock,
                  text: formatEventTimeRange(event),
                },
                {
                  icon: event.location === null ? Video : MapPin,
                  text: event.location ?? "Online",
                },
              ]}
            />
          </div>

          {hasCover && (
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted shadow-card">
              <Image
                src={event.coverImage!}
                alt={event.title}
                fill
                sizes="(min-width: 768px) 400px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
