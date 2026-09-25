import Link from "next/link";

import {
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Video,
} from "lucide-react";

import Container from "@/app/components/reusable/Container";
import MetaRow from "@/app/components/reusable/MetaRow";
import Tag from "@/app/components/reusable/Tag";
import {
  Blob,
  LeafOrnament,
} from "@/app/components/reusable/Ornaments";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

import {
  formatEventDateLong,
  formatEventPrice,
  formatEventTimeRange,
} from "../data/eventTime";

import type { EventDetail } from "../data/events";

type EventHeroProps = {
  event: EventDetail;
  now: string;
};

export default function EventHero({
  event,
  now,
}: EventHeroProps) {
  const currentTime = new Date(now);

  const hasEnded =
    event.endDate.getTime() <= currentTime.getTime();

  const isSoldOut =
    !hasEnded && event.soldOut;

  const remaining =
    !hasEnded && event.remaining !== null
      ? Math.max(event.remaining, 0)
      : null;

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <Blob
          tone="lavender"
          className="absolute -left-24 -top-24 size-72 opacity-70"
        />

        <Blob
          tone="mint"
          className="absolute -right-16 top-32 size-64 opacity-60"
        />

        <LeafOrnament className="absolute right-6 top-0 hidden h-56 lg:block" />
      </div>

      <Container className="py-14 md:py-20">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="mint">
              {event.category.name}
            </Tag>

            <Tag tone="lavender">
              {event.format}
            </Tag>
          </div>

          <h1 className="mt-4 font-heading text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground md:text-[40px] lg:text-[46px]">
            {event.title}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {event.description}
          </p>

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
                icon:
                  event.location === null
                    ? Video
                    : MapPin,
                text:
                  event.location ?? "Online",
              },
            ]}
          />

          {event.focusAreas.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {event.focusAreas.map((area) => (
                <Tag
                  key={area.id}
                  tone="lavender"
                >
                  {area.name}
                </Tag>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            {hasEnded ? (
              <p className="text-base font-semibold text-muted-foreground">
                This event has ended.
              </p>
            ) : (
              <>
                <p className="flex items-baseline gap-1.5 text-lg font-semibold text-foreground">
                  <Ticket
                    className="size-5 shrink-0 self-center text-accent"
                    aria-hidden="true"
                  />

                  {formatEventPrice(event.price)}

                  {event.price > 0 && (
                    <span className="text-base font-normal text-muted-foreground">
                      / person
                    </span>
                  )}
                </p>

                {isSoldOut ? (
                  <>
                    <span className="rounded-full bg-brand-lavender-200 px-3 py-1 text-sm font-semibold text-secondary">
                      Sold out
                    </span>

                    <Link
                      href="/#contact"
                      className={buttonStyles({
                        variant: "secondary",
                        size: "lg",
                      })}
                    >
                      Ask about the next date
                    </Link>
                  </>
                ) : (
                  <>
                    {remaining !== null && (
                      <span className="text-base text-muted-foreground">
                        {remaining}{" "}
                        {remaining === 1
                          ? "seat"
                          : "seats"}{" "}
                        left
                      </span>
                    )}

                    <Link
                      href="/#contact"
                      className={buttonStyles({
                        variant: "primary",
                        size: "lg",
                      })}
                    >
                      Request a seat
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}