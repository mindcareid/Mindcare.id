import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  MapPin,
} from "lucide-react";

import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { EventDetail } from "../data/events";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

const cardClass =
  "mt-6 flex max-w-2xl flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:flex-row";

const avatarClass =
  "flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-lavender-200 font-heading text-xl font-semibold text-secondary";

type EventHostCardProps = {
  event: EventDetail;
};

export default function EventHostCard({ event }: EventHostCardProps) {
  const professional = event.professional;
  const careCentre = event.careCentre;

  return (
    <section aria-labelledby="event-host-title">
      <SectionHeader title="Hosted by" underline />

      {professional && (
        <div className={cardClass}>
          <span className={avatarClass}>
            <span aria-hidden="true">{initialsOf(professional.fullName)}</span>
          </span>
          <div className="min-w-0">
            <p id="event-host-title" className="font-heading text-lg font-semibold text-foreground">
              {professional.fullName}
            </p>
            {professional.headline && (
              <p className="mt-2 max-w-prose text-base leading-relaxed text-muted-foreground">
                {professional.headline}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-muted-foreground">
              {professional.yearsOfExperience !== null && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="size-3.5 shrink-0" aria-hidden="true" />
                  {professional.yearsOfExperience} {professional.yearsOfExperience === 1 ? "yr" : "yrs"} experience
                </span>
              )}
            </div>
            <Link
              href={`/professionals/${professional.slug}`}
              className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-navy-800"
            >
              View profile
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}

      {!professional && careCentre && (
        <div className={cardClass}>
          <span className={avatarClass}>
            <Building2 className="size-7" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p id="event-host-title" className="font-heading text-lg font-semibold text-foreground">
              {careCentre.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{careCentre.kind}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {careCentre.city}, {careCentre.province}
              </span>
            </div>
            <Link
              href={`/care-centres/${careCentre.slug}`}
              className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-navy-800"
            >
              View care centre
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}

      {!professional && !careCentre && (
        <div className={cardClass}>
          <span className={avatarClass}>
            <span aria-hidden="true">{initialsOf(event.host.name)}</span>
          </span>
          <div className="min-w-0">
            <p id="event-host-title" className="font-heading text-lg font-semibold text-foreground">
              {event.host.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">MindCare</p>
          </div>
        </div>
      )}
    </section>
  );
}
