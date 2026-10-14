import { ExternalLink, MapPin, Phone } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { CareCentre } from "../type/careCentre";

type CentreLocationProps = {
  centre: CareCentre;
};

export default function CentreLocation({ centre }: CentreLocationProps) {
  const { street, city, province, postalCode } = centre.address;

  const address = `${street}, ${city}, ${postalCode}, ${province}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${centre.name}, ${address}`,
  )}`;

  return (
    <div>
      <SectionHeader title="Location" underline />

      <div className="mt-6 max-w-2xl rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex gap-3">
          <MapPin
            className="mt-1 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />

          <div className="flex-1">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Open ${centre.name} location in Google Maps`}
              className="group inline-flex items-start gap-1.5 text-base leading-relaxed font-medium text-foreground transition-colors hover:text-primary"
            >
              <address className="not-italic">{address}</address>
              <ExternalLink
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        {centre.phone && (
          <div className="mt-5 border-t border-border pt-5">
            <a
              href={`tel:${centre.phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <Phone
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              {centre.phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
