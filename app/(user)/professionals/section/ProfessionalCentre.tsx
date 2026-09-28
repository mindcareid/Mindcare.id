import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import Tag from "@/app/components/reusable/Tag";
import VerifiedBadge from "@/app/components/reusable/VerifiedBadge";
import {
  VERIFICATION_POLICY_PATH,
  verificationLabelOf,
} from "../../data/verification";
import type { CareCentre } from "../../care-centres/type/careCentre";

type ProfessionalCentreProps = {
  centre: CareCentre;
  now: string;
};

export default function ProfessionalCentre({
  centre,
  now,
}: ProfessionalCentreProps) {
  const verifiedLabel = verificationLabelOf(
    centre.verification,
    now,
    "facility",
  );

  return (
    <div>
      <SectionHeader title="Practises at" underline />

      <div className="mt-6 flex max-w-2xl flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:flex-row">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand-mint-200">
          <Building2 className="size-7 text-accent" aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-lg font-semibold text-foreground">
              {centre.name}
            </p>
            {verifiedLabel && (
              <VerifiedBadge
                label={verifiedLabel}
                href={VERIFICATION_POLICY_PATH}
              />
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">{centre.kind}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {`${centre.address.street}, ${centre.address.city}`}
            </span>
          </div>

          {centre.acceptsBpjs && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tag tone="mint">BPJS accepted</Tag>
            </div>
          )}

          <Link
            href={`/care-centres/${centre.slug}`}
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-navy-800"
          >
            View care centre
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
