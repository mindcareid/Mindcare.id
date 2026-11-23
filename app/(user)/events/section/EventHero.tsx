import { CalendarDays, Clock, MapPin, Video } from "lucide-react";
import Image from "next/image";

import Container from "@/app/components/reusable/Container";
import MetaRow from "@/app/components/reusable/MetaRow";
import Tag from "@/app/components/reusable/Tag";
import { eventFormatLabel } from "@/lib/events/labels";

import {
  formatEventDateLong,
  formatEventTimeRange,
  hasEnded,
} from "../data/eventTime";

import type { EventDetail } from "../data/events";
import { RegistrationAction, priceFormatter } from "./EventDetailRail";

type EventHeroProps = {
  event: EventDetail;
  now: string;
};

export default function EventHero({ event, now }: EventHeroProps) {
  const hasCover = Boolean(event.coverImage);
  const ended = hasEnded(event, now);
  const soldOut = !ended && event.soldOut;
  const remaining =
    !ended && event.remaining !== null ? Math.max(event.remaining, 0) : null;
  const isFree = event.price <= 0;

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
              <Tag tone="lavender">{eventFormatLabel(event.format)}</Tag>
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

            {/* CTA & Price Info */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <RegistrationAction
                event={event}
                now={now}
                className="w-full sm:w-auto"
              />

              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Price</span>
                  <span className="text-lg font-bold text-foreground">
                    {isFree ? "Free" : priceFormatter.format(event.price)}
                  </span>
                </div>

                {!ended && remaining !== null && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      soldOut
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {soldOut ? "Sold out" : `${remaining} spots left`}
                  </span>
                )}
              </div>
            </div>
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
