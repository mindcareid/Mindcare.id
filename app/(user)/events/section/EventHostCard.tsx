import Link from "next/link";
import { ArrowRight, Building2, GraduationCap, MapPin } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import Tag from "@/app/components/reusable/Tag";
import VerifiedBadge from "@/app/components/reusable/VerifiedBadge";
import {
  VERIFICATION_POLICY_PATH,
  verificationLabelOf,
} from "../../data/verification";
import type { CareCentre } from "../../care-centres/type/careCentre";
import type { Professional } from "../../professionals/type/professional";
import type { EventHost } from "../type/event";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

const cardClass =
  "mt-6 flex max-w-2xl flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:flex-row";

const avatarClass =
  "flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-lavender-200 font-heading text-xl font-semibold text-secondary";

type EventHostCardProps = {
  host: EventHost;
  professional: Professional | null;
  centre: CareCentre | null;
  now: string;
};

export default function EventHostCard({
  host,
  professional,
  centre,
  now,
}: EventHostCardProps) {
  const professionalLabel = professional
    ? verificationLabelOf(professional.verification, now, "person")
    : null;
  const centreLabel = centre
    ? verificationLabelOf(centre.verification, now, "facility")
    : null;

  return (
    <div>
      <SectionHeader title="Hosted by" underline />

      {professional ? (
        <div className={cardClass}>
          <span className={avatarClass}>
            <span aria-hidden="true">{initialsOf(professional.fullName)}</span>
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-lg font-semibold text-foreground">
                {professional.fullName}
              </p>
              {professionalLabel && (
                <VerifiedBadge
                  label={professionalLabel}
                  href={VERIFICATION_POLICY_PATH}
                />
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {professional.credentials}
            </p>

            <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground">
              {professional.headline}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {`${professional.yearsOfExperience} yrs experience`}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {professional.location.city}
              </span>
            </div>

            <Link
              href={`/professionals/${professional.slug}`}
              className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-navy-800"
            >
              View profile
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      ) : centre ? (
        <div className={cardClass}>
          <span className={avatarClass}>
            <Building2 className="size-7" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-lg font-semibold text-foreground">
                {centre.name}
              </p>
              {centreLabel && (
                <VerifiedBadge
                  label={centreLabel}
                  href={VERIFICATION_POLICY_PATH}
                />
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">{centre.kind}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {`${centre.address.city}, ${centre.address.province}`}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {centre.services.slice(0, 3).map((service) => (
                <Tag key={service.id} tone="mint">
                  {service.name}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={cardClass}>
          <span className={avatarClass}>
            <span aria-hidden="true">{initialsOf(host.name)}</span>
          </span>
          <div className="min-w-0">
            <p className="font-heading text-lg font-semibold text-foreground">
              {host.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {host.kind === "professional" ? "Professional" : "Care centre"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
