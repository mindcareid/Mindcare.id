import { MapPin } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import CentresMapPlaceholder from "./CentresMapPlaceholder";
import type { CareCentre } from "../type/careCentre";


type CentreLocationProps = {
  centre: CareCentre;
};

export default function CentreLocation({ centre }: CentreLocationProps) {
  const { street, city, province, postalCode } = centre.address;

  return (
    <div>
      <SectionHeader title="Location" underline />

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex gap-3 ">
            <MapPin
              className="mt-1 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <address className="flex-1 text-base leading-relaxed text-foreground not-italic">
              {street}, {city}, {postalCode}, {province}
            </address>
          </div>

          <p className="mt-5 border-t border-border pt-5 text-[13px] text-muted-foreground">
            Phone numbers and directions are not published in the directory yet.
          </p>
        </div>

        <CentresMapPlaceholder caption={`${city}, ${province}`} />
      </div>
    </div>
  );
}
