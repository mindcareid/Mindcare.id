"use client";

import {
  formatDate,
  formatTimeOnly,
  sameDate,
  getTimeZoneLabel,
} from "@/lib/utils/FormatDate";
import { Clock, MapPin, CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import type { EventCardItem } from "@/lib/events";

interface EventCardProps {
  event: EventCardItem;
}

function EventLandscape({ event }: EventCardProps) {
  const isSoldOut = event.soldOut ?? false;

  return (
    <Link
      href={isSoldOut ? "#" : `/events/${event.slug}`}
      className={`
        group flex flex-col overflow-hidden rounded-2xl
        bg-white border border-gray-200
        shadow-lg transition-all duration-300
        hover:shadow-2xl hover:shadow-blue-100
        sm:flex-row sm:items-stretch
        ${isSoldOut ? "pointer-events-none opacity-60" : ""}
      `}
    >
      
      <div className="relative w-full aspect-video shrink-0 sm:w-56 sm:aspect-auto">
        <Image
          src={event.coverImage || "/images/placeholder.png"}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 224px, 288px"
          className="object-cover sm:object-contain transition-transform duration-500 rounded-t-2xl sm:rounded-2xl"
        />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 px-5 py-6 sm:px-6 sm:py-10">
        <h3 className="text-lg md:text-2xl font-bold leading-snug text-neutral-900 sm:text-xl line-clamp-2">
          {event.title}
        </h3>

        <div className="flex flex-col gap-2 text-sm text-neutral-900 sm:text-base">
          <div className="flex items-start gap-2 sm:items-center sm:gap-2.5">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900 sm:mt-0 sm:h-5 sm:w-5" />
            <span>
              {sameDate(event.startDate, event.endDate, event.timeZone)
                ? formatDate(event.startDate, event.timeZone)
                : `${formatDate(event.startDate, event.timeZone)} - ${formatDate(event.endDate, event.timeZone)}`}{" "}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-neutral-900 sm:h-5 sm:w-5" />
            <span>
              {formatTimeOnly(event.startDate, event.timeZone)}-{" "}
              {formatTimeOnly(event.endDate, event.timeZone)}{" "}
              {getTimeZoneLabel(event.startDate, event.timeZone)}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-neutral-900 sm:h-5 sm:w-5" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {isSoldOut && (
          <span className="mt-1 inline-block w-fit rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-300">
            Sold Out
          </span>
        )}
      </div>
    </Link>
  );
}

export default memo(EventLandscape);
