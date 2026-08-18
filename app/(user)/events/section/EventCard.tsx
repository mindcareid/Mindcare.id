import Link from "next/link";
import Image from "next/image";
import { formatDate, formatTimeOnly } from "@/lib/utils/FormatDate";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import { FaRegClock } from "react-icons/fa";
import { sameDate } from "@/lib/utils/FormatDate";
import { memo } from "react";

import type { EventCardItem } from "@/lib/events/types";
import { getTimeZoneLabel } from "../../../../lib/utils/FormatDate";

interface EventCardProps {
  event: EventCardItem;
}

function EventCard({ event }: EventCardProps) {
  const isSoldOut = event.soldOut ?? false;
  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden
  hover:shadow-xl transition-all duration-300
  flex flex-col h-full"
    >
      <div className="relative w-full h-100 aspect-video overflow-hidden">
        <Image
          src={event.coverImage || "/images/placeholder.png"}
          alt={event.title}
          fill
          className=" object-cover"
        />

        <div
          className="absolute top-3 right-3 bg-white/90 backdrop-blur
    px-3 py-1 rounded-full text-xs font-semibold text-gray-700"
        >
          {event.category.name}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 min-h-10">
        <div className="mb-4 min-h-10">
          <h3 className="text-lg font-bold line-clamp-1">{event.title}</h3>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-gray-400" />
            <span>
              {sameDate(event.startDate, event.endDate)
                ? formatDate(event.startDate)
                : `${formatDate(event.startDate)} - ${formatDate(event.endDate)} `}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaRegClock className="text-gray-400" />
            <span>
              {formatTimeOnly(event.startDate, event.timeZone)}-{" "}
              {formatTimeOnly(event.endDate, event.timeZone)}{" "}
              {getTimeZoneLabel(event.startDate, event.timeZone)}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <FiMapPin className="text-gray-400" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-600">
            {event.price === 0
              ? "Free"
              : `Rp ${event.price.toLocaleString("id-ID")}`}
          </span>

          {event.soldOut ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
              Sold Out
            </span>
          ) : event.remaining != null ? (
            <span className="text-xs text-gray-500">
              {event.remaining} seats left
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              {event.quota ? `${event.quota} seats` : "Unlimited"}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t">
          <Link
            href={isSoldOut ? "#" : `/events/${event.slug}`}
            className={`block text-center w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              event.soldOut
                ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {event.soldOut ? "Sold Out" : "View Details"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(EventCard);
