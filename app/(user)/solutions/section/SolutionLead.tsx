import Link from "next/link";
import { ArrowRight, GraduationCap, MapPin } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import Tag from "@/app/components/reusable/Tag";
import VerifiedBadge from "@/app/components/reusable/VerifiedBadge";
import type { Professional } from "../../professionals/type/professional";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

type SolutionLeadProps = {
  professional: Professional;
};

// Judulnya "Led by", bukan "Facilitator" atau "Instructor": satu orang yang
// memimpin rangkaian, sementara pelaksananya bisa lebih dari satu. Kontraknya
// memang cuma menyimpan SATU slug (`leadProfessionalSlug`), jadi menyebut
// "Facilitators" akan menjanjikan daftar yang tidak ada datanya.
export default function SolutionLead({ professional }: SolutionLeadProps) {
  return (
    <div>
      <SectionHeader title="Led by" underline />

      <div className="mt-6 flex max-w-2xl flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:flex-row">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-lavender-200 font-heading text-xl font-semibold text-secondary">
          <span aria-hidden="true">{initialsOf(professional.fullName)}</span>
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-lg font-semibold text-foreground">
              {professional.fullName}
            </p>
            {professional.isVerified && <VerifiedBadge />}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {professional.credentials}
          </p>

          <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground">
            {professional.headline}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="size-3.5 shrink-0" aria-hidden="true" />
              {`${professional.yearsOfExperience} yrs experience`}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {professional.location.city}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {professional.approaches.slice(0, 3).map((approach) => (
              <Tag key={approach.id} tone="mint">
                {approach.name}
              </Tag>
            ))}
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
    </div>
  );
}
