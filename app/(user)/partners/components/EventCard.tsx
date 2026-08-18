"use client";

import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaRegClock } from "react-icons/fa";
import { IoImageOutline, IoLocationSharp } from "react-icons/io5";

import { formatDate, formatTimeOnly } from "@/lib/utils/FormatDate";
import { Event } from "../type/type-partners";
import { getTimeZoneLabel } from "../../../../lib/utils/FormatDate";

export default function EventCard({ event }: { event: Event }) {
  const isFree = event.price === 0;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            sizes="(max-width:768px) 100vw,
                   (max-width:1024px) 50vw,
                   33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <div className="flex flex-col items-center gap-2">
              <IoImageOutline className="h-10 w-10" />
              <span className="text-sm">No Image</span>
            </div>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 shadow backdrop-blur">
          {event.category.name}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="min-h-14 line-clamp-2 text-lg font-bold leading-7 text-gray-900">
          {event.title}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="shrink-0 text-gray-400" />
            <span className="line-clamp-1">
              {formatDate(event.startDate, event.timeZone)} –{" "}
              {formatDate(event.endDate, event.timeZone)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FaRegClock className="shrink-0 text-gray-400" />
            <span>
              {formatTimeOnly(event.startDate, event.timeZone)}-{" "}
              {formatTimeOnly(event.endDate, event.timeZone)}{" "}
              {getTimeZoneLabel(event.startDate, event.timeZone)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <IoLocationSharp className="shrink-0 text-gray-400" />
            <span className="line-clamp-1">{event.location || "-"}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <span
              className={`text-lg font-bold ${
                isFree ? "text-emerald-600" : "text-blue-600"
              }`}
            >
              {isFree ? "Free" : `Rp ${event.price.toLocaleString("id-ID")}`}
            </span>

            <span className="text-sm font-medium text-blue-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
