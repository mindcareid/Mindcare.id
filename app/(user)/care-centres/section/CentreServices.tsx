import { Check } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { CareCentre } from "../type/careCentre";


type CentreServicesProps = {
  centre: CareCentre;
};

export default function CentreServices({ centre }: CentreServicesProps) {
  if (centre.services.length === 0) return null;

  return (
    <div>
      <SectionHeader title={`Service at ${centre.name}`} underline />

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {centre.services.map((service) => (
          <li
            key={service.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-mint-100">
              <Check className="size-4 text-accent" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-foreground">
              {service.name}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 max-w-prose text-[13px] text-muted-foreground">
        Session fees for care centres are not listed in the directory yet.
      </p>
    </div>
  );
}
