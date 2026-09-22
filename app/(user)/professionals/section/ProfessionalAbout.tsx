import SectionHeader from "@/app/components/reusable/SectionHeader";
import Tag from "@/app/components/reusable/Tag";
import type { Professional } from "../type/professional";

type ProfessionalAboutProps = {
  professional: Professional;
};

export default function ProfessionalAbout({
  professional,
}: ProfessionalAboutProps) {
  
  const hasAreas = professional.areasOfSupport.length > 0;
  const hasApproaches = professional.approaches.length > 0;

  return (
    <div>
      <SectionHeader title="About" underline />

      <div className="mt-6 max-w-prose space-y-4">
        {professional.bio.map((paragraph, index) => (
          <p
            key={index}
            className="text-base leading-relaxed text-muted-foreground"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {hasAreas || hasApproaches ? (
        <div
          className={
            hasAreas && hasApproaches
              ? "mt-10 grid gap-8 md:grid-cols-2"
              : "mt-10"
          }
        >
          {hasAreas ? (
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Areas of support
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {professional.areasOfSupport.map((area) => (
                  <Tag key={area.id} tone="lavender">
                    {area.name}
                  </Tag>
                ))}
              </div>
            </div>
          ) : null}

          {hasApproaches ? (
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Therapy approaches
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {professional.approaches.map((approach) => (
                  <Tag key={approach.id} tone="mint">
                    {approach.name}
                  </Tag>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
