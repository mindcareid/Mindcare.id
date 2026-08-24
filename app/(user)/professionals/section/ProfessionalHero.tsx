import {
  Clock,
  ExternalLink,
  GraduationCap,
  MapPin,
  MessageCircle,
} from "lucide-react";
import MetaRow from "@/app/components/reusable/MetaRow";
import PageHero from "@/app/components/reusable/PageHero";
import StatusDot from "@/app/components/reusable/StatusDot";
import Tag from "@/app/components/reusable/Tag";
import VerifiedBadge from "@/app/components/reusable/VerifiedBadge";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import type { Professional } from "../type/professional";

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

type ProfessionalHeroProps = {
  professional: Professional;
};

export default function ProfessionalHero({
  professional,
}: ProfessionalHeroProps) {
  return (
    <PageHero
      eyebrow={professional.profession}
      title={professional.fullName}
      subtitle={professional.headline}
      media={
        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl border border-border bg-brand-lavender-100 lg:max-w-md">
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-linear-to-br from-brand-lavender-200 to-brand-mint-200 font-heading text-6xl font-semibold text-primary/60"
          >
            {initialsOf(professional.fullName)}
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {(professional.isVerified || professional.isAvailableNow) && (
          <div className="flex flex-wrap items-center gap-2">
            {professional.isVerified && <VerifiedBadge />}
            {professional.isAvailableNow && (
              <span className="inline-flex items-center rounded-sm border border-border bg-card px-2 py-1">
                <StatusDot status="online" />
              </span>
            )}
          </div>
        )}

        <MetaRow
          items={[
            { icon: GraduationCap, text: professional.credentials },
            {
              icon: MapPin,
              text: `${professional.location.city}, ${professional.location.province}`,
            },
            {
              icon: Clock,
              text: `${professional.yearsOfExperience} yrs experience`,
            },
            { icon: MessageCircle, text: professional.languages.join(", ") },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          {professional.sessionModes.map((mode) => (
            <Tag key={mode} tone="mint">
              {mode}
            </Tag>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <p className="text-lg font-semibold text-foreground">
            {`From ${priceFormatter.format(professional.startingPriceIdr)}`}
            <span className="text-base font-normal text-muted-foreground">
              {" / session"}
            </span>
          </p>

          {professional.bookingUrl && (
            <a
              href={professional.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              Book a Session
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </PageHero>
  );
}
