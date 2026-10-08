import { Building2, MapPin, Users } from "lucide-react";
import MetaRow from "@/app/components/reusable/MetaRow";
import PageHero from "@/app/components/reusable/PageHero";
import StatusDot from "@/app/components/reusable/StatusDot";
import Tag from "@/app/components/reusable/Tag";
import VerifiedBadge from "@/app/components/reusable/VerifiedBadge";
import { isOpenAt, summariseTodayHours } from "../data/centreHours";
import {
  VERIFICATION_POLICY_PATH,
  formatCheckedOn,
  verificationLabelOf,
} from "../../data/verification";
import type { CareCentre } from "../type/careCentre";
import Image from "next/image";

type CentreHeroProps = {
  centre: CareCentre;
  now: string;
};

export default function CentreHero({ centre, now }: CentreHeroProps) {
  const listed = centre.professionalSlugs.length;
  const open = isOpenAt(centre, now);
  const verifiedLabel = verificationLabelOf(
    centre.verification,
    now,
    "facility",
  );

  return (
    <PageHero
      eyebrow={centre.kind}
      title={centre.name}
      subtitle={`${centre.address.street}, ${centre.address.city}`}
      media={
        centre.photoUrl ? (
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted shadow-card">
            <Image
              src={centre.photoUrl}
              alt={centre.name}
              fill
              sizes="(min-width: 768px) 400px, 100vw"
              className="object-cover"
            />
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        {(verifiedLabel || open) && (
          <div className="flex flex-wrap items-center gap-2">
            {verifiedLabel && (
              <VerifiedBadge
                label={verifiedLabel}
                checkedOn={formatCheckedOn(centre.verification)}
                href={VERIFICATION_POLICY_PATH}
              />
            )}
            {open && (
              <span className="inline-flex items-center rounded-sm border border-border bg-card px-2 py-1">
                <StatusDot status="open" label="Open now" />
              </span>
            )}
          </div>
        )}

        <MetaRow
          items={[
            {
              icon: MapPin,
              text: `${centre.address.city}, ${centre.address.province}`,
            },
            { icon: Building2, text: summariseTodayHours(centre, now) },
            {
              icon: Users,
              text: `${listed} ${listed === 1 ? "professional" : "professionals"} listed`,
            },
          ]}
        />
        {centre.acceptsBpjs && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="mint">BPJS accepted</Tag>
          </div>
        )}
      </div>
    </PageHero>
  );
}
