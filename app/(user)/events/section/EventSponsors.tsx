import SectionHeader from "@/app/components/reusable/SectionHeader";
import {
  SPONSOR_LOGO_GAP,
  SPONSOR_LOGO_HEIGHT,
  SPONSOR_LOGO_MAX_WIDTH,
} from "@/lib/sponsors/shared";
import type { EventDetail } from "../data/events";
import Image from "next/image";
import { GroupSponsors } from "@/lib/events/groupsponsor";

export default function EventSponsors({ event }: { event: EventDetail }) {
  const groups = GroupSponsors(event.sponsorGroups ?? []);

  if (groups.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Our Sponsors" underline />

      <div className="mt-8 space-y-10">
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="text-sm font-semibold text-foreground">
              {group.label}
            </h3>

            <ul
              className="mt-4 flex flex-wrap items-center"
              style={{ gap: SPONSOR_LOGO_GAP }}
            >
              {group.sponsors.map((sponsor) => {
                const logo = (
                  <Image
                    src={sponsor.logoUrl}
                    alt={`${sponsor.name} logo`}
                    width={SPONSOR_LOGO_MAX_WIDTH}
                    height={SPONSOR_LOGO_HEIGHT}
                    style={{
                      height: SPONSOR_LOGO_HEIGHT,
                      width: "auto",
                      maxWidth: SPONSOR_LOGO_MAX_WIDTH,
                    }}
                    loading="lazy"
                    decoding="async"
                  />
                );

                return (
                  <li key={sponsor.id}>
                    {sponsor.websiteUrl ? (
                      <a
                        href={sponsor.websiteUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`${sponsor.name} website`}
                        className="inline-flex items-center rounded transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                      >
                        {logo}
                      </a>
                    ) : (
                      logo
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
