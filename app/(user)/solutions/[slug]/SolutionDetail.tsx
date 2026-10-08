import { Info } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { Professional } from "../../professionals/type/professional";
import PartnerStrip from "../section/PartnerStrip";
import SolutionHero from "../section/SolutionHero";
import SolutionInformation from "../section/SolutionInformation";
import SolutionDetailRail from "../section/SolutionDetailRail";
import SolutionLead from "../section/SolutionLead";
import SolutionOverview from "../section/SolutionOverview";
import SolutionsGrid from "../section/SolutionsGrid";
import type { Solution } from "../type/solution";

type SolutionDetailProps = {
  solution: Solution;
  lead: Professional | null;
  related: Solution[];
  now: string;
};

export default function SolutionDetail({
  solution,
  lead,
  related,
  now,
}: SolutionDetailProps) {
  return (
    <div className="min-h-screen">
      <SolutionHero solution={solution} />

      <Container className="pb-24">
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-16">
            <SolutionOverview solution={solution} />
          <SolutionInformation solution={solution} />

          {lead && <SolutionLead professional={lead} now={now} />}
            {solution.partners.length > 0 && (
              <div>
                <SectionHeader title="Delivered with" underline />
                <PartnerStrip
                  partners={solution.partners}
                  className="mt-6 justify-start"
                />
              </div>
            )}

            {solution.partners.length > 0 && (
              <div className="flex gap-3 rounded-xl border border-border bg-brand-mint-100/50 p-5">
                <Info
                  className="mt-0.5 size-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed text-foreground">
                  This programme is built with the lead professional and can be
                  adjusted after the first session. The content and order shown
                  here are an overview, not a fixed sequence.
                </p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <SolutionDetailRail solution={solution} />
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              More solutions
            </h2>
            <SolutionsGrid solutions={related} className="mt-8" />
          </section>
        )}
      </Container>
    </div>
  );
}
