"use client";

import { memo } from "react";
import CarouselButton from "./CarouselButton";
import CarouselTrack from "./CarouselTrack";
import { useCarousel } from "./useCarousel";
import EventCard from "@/app/(user)/partners/components/EventCard";
import type { Event } from "@/app/(user)/partners/type/type-partners";

type Props = {
  title: string;

  events: Event[];

  autoplay?: boolean;
};

function EventCarousel({ title, events, autoplay = true }: Props) {
  const {
    containerRef,

    canPrev,
    canNext,

    scroll,

    setIsDragging,
    setIsHovering,
  } = useCarousel({
    autoplay,
    interval: 4500,
  });

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="my-8">
      {/* Header */}

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />

          <h2 className="text-xl font-semibold">{title}</h2>

          <span className="text-sm text-muted-foreground">
            ({events.length})
          </span>
        </div>

        {events.length > 3 && (
          <div className="flex items-center gap-2">
            <CarouselButton
              direction="left"
              disabled={!canPrev}
              onClick={() => scroll("left")}
            />

            <CarouselButton
              direction="right"
              disabled={!canNext}
              onClick={() => scroll("right")}
            />
          </div>
        )}
      </div>

      {/* Track */}

      <CarouselTrack
        containerRef={containerRef}
        setIsDragging={setIsDragging}
        setIsHovering={setIsHovering}
      >
        {events.map((event) => (
          <div
            key={event.id}
            data-carousel-card
            className="
    shrink-0
    snap-start

    basis-full
    sm:basis-[48%]
    lg:basis-[32%]
    xl:basis-[24%]
  "
          >
            <EventCard event={event} />
          </div>
        ))}
      </CarouselTrack>
    </section>
  );
}

export default memo(EventCarousel);
