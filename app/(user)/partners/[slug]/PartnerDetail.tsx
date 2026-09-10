import Image from "next/image";
import Link from "next/link";

import {
  FiGlobe,
  FiInstagram,
  FiLinkedin,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";

import { MdOutlineKeyboardArrowRight } from "react-icons/md";

import EventCarousel from "@/app/components/eventcarousel/EventCarousel";

import type { Company, Event } from "../type/type-partners";

type Props = {
  company: Company;
  events: Event[];
};

export default function PartnerDetail({ company, events }: Props) {
  const now = new Date();

  const ongoingEvents = events.filter(
    (event) =>
      new Date(event.startDate) <= now && new Date(event.endDate) >= now,
  );

  const upcomingEvents = events.filter(
    (event) => new Date(event.startDate) > now,
  );

  const pastEvents = events.filter((event) => new Date(event.endDate) < now);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* ================= Breadcrumb ================= */}

      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="transition hover:text-blue-600">
          Home
        </Link>

        <MdOutlineKeyboardArrowRight className="h-4 w-4" />

        <Link href="/partners" className="transition hover:text-blue-600">
          Partners
        </Link>

        <MdOutlineKeyboardArrowRight className="h-4 w-4" />

        <span className="font-medium text-gray-900">{company.name}</span>
      </div>

      {/* ================= Company ================= */}

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}

          <div className="flex items-center gap-4">
            <Image
              src={company.logo ?? "/images/no-image.png"}
              alt={company.name}
              width={90}
              height={90}
              className="rounded-xl border border-gray-200 object-cover"
            />

            <div>
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {company.name}
              </h1>

              {company.location && (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <FiMapPin className="shrink-0 text-gray-400" />

                  <span>{company.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right */}

          <div className="flex items-center gap-3">
            {company.website && (
              <Link
                href={`${company.website}`}
                target="_blank"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
              >
                <FiGlobe className="text-lg text-gray-700" />
              </Link>
            )}

            {company.instagram && (
              <Link
                href={`https://instagram.com/${company.instagram}`}
                target="_blank"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
              >
                <FiInstagram className="text-lg text-gray-700" />
              </Link>
            )}

            {company.linkedin && (
              <Link
                href={`${company.linkedin}`}
                target="_blank"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
              >
                <FiLinkedin className="text-lg text-gray-700" />
              </Link>
            )}

            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
              >
                <FiPhone className="text-lg text-gray-700" />
              </a>
            )}
          </div>
        </div>

        {company.description && (
          <p className="mt-6 leading-relaxed text-gray-600">
            {company.description}
          </p>
        )}

        {/* ================= Event Sections ================= */}
        <EventCarousel title="Ongoing Events" events={ongoingEvents} />

        <EventCarousel title="Upcoming Events" events={upcomingEvents} />

        <EventCarousel title="Past Events" events={pastEvents} />

        {/* ================= Empty State ================= */}
        {events.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">
            No events found
          </div>
        )}
      </div>
    </section>
  );
}
