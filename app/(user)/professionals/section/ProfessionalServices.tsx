import SectionHeader from "@/app/components/reusable/SectionHeader";
import Tag from "@/app/components/reusable/Tag";
import type { Professional } from "../type/professional";

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type ProfessionalServicesProps = {
  professional: Professional;
};

export default function ProfessionalServices({
  professional,
}: ProfessionalServicesProps) {
  if (professional.services.length === 0) return null;

  const services = [...professional.services].sort(
    (a, b) => a.priceIdr - b.priceIdr,
  );

  return (
    <div>
      <SectionHeader title="Sessions & Pricing" underline />

      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {services.map((service) => (
          <li
            key={service.id}
            className="flex flex-wrap items-center justify-between gap-3 p-5"
          >
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                {service.name}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Tag tone="mint">{service.mode}</Tag>
                <span className="text-[13px] font-medium text-muted-foreground">
                  {`${service.durationMinutes} min`}
                </span>
              </div>
            </div>

            <p className="text-lg font-semibold text-foreground">
              {priceFormatter.format(service.priceIdr)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
