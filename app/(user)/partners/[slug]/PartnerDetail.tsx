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

      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition hover:text-primary">
          Home
        </Link>

        <MdOutlineKeyboardArrowRight className="h-4 w-4" />

        <Link href="/partners" className="transition hover:text-primary">
          Partners
        </Link>

        <MdOutlineKeyboardArrowRight className="h-4 w-4" />

        <span className="font-medium text-foreground">{company.name}</span>
      </div>

      {/* ================= Company ================= */}

      <div className="rounded-xl border border-border bg-card p-8 shadow-card">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}

          <div className="flex items-center gap-4">
            <Image
              src={company.logo ?? "/images/no-image.png"}
              alt={company.name}
              width={90}
              height={90}
              className="rounded-xl border border-border object-cover"
            />

            <div>
              <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                {company.name}
              </h1>

              {company.location && (
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <FiMapPin className="shrink-0 text-muted-foreground" />

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
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <FiGlobe className="text-lg" />
              </Link>
            )}

            {company.instagram && (
              <Link
                href={`https://instagram.com/${company.instagram}`}
                target="_blank"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <FiInstagram className="text-lg" />
              </Link>
            )}

            {company.linkedin && (
              <Link
                href={`${company.linkedin}`}
                target="_blank"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <FiLinkedin className="text-lg" />
              </Link>
            )}

            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <FiPhone className="text-lg" />
              </a>
            )}
          </div>
        </div>

        {company.description && (
          <p className="mt-6 leading-relaxed text-muted-foreground">
            {company.description}
          </p>
        )}

        {/* ================= Event Sections ================= */}
        <EventCarousel title="Ongoing Events" events={ongoingEvents} />

        <EventCarousel title="Upcoming Events" events={upcomingEvents} />

        <EventCarousel title="Past Events" events={pastEvents} />

        {/* ================= Empty State ================= */}
        {events.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No events found
          </div>
        )}
      </div>
    </section>
  );
}
