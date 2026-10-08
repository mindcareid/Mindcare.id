import { MapPin } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import Tag from "@/app/components/reusable/Tag";

import type { Solution } from "../type/solution";
import Image from "next/image";

type SolutionHeroProps = {
  solution: Solution;
};

export default function SolutionHero({ solution }: SolutionHeroProps) {
  const hasCover = Boolean(solution.coverImageUrl);

  return (
    <section className="border-b border-border bg-card">
      <Container className="py-10 md:py-14">
        <div
          className={
            hasCover
              ? "grid items-start gap-10 md:grid-cols-[1fr_400px] md:gap-12"
              : ""
          }
        >
          <div className={hasCover ? "" : "max-w-3xl"}>
            <Tag tone="mint">{solution.category.name}</Tag>

            <h1 className="mt-4 font-heading text-[28px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground md:text-[36px] lg:text-[42px]">
              {solution.title}
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {solution.summary}
            </p>

            <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              {solution.organizationName}
            </p>

            {solution.focusAreas.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {solution.focusAreas.map((area) => (
                  <Tag key={area.id} tone="lavender">
                    {area.name}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {hasCover && (
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted shadow-card">
              <Image
                src={solution.coverImageUrl!}
                alt={solution.title}
                fill
                sizes="(min-width: 768px) 400px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
