import Link from "next/link";
import Container from "@/app/components/reusable/Container";
import PageHero from "@/app/components/reusable/PageHero";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import PartnerStrip from "./section/PartnerStrip";
import SolutionsGrid from "./section/SolutionsGrid";
import type { Solution, SolutionPartner } from "./type/solution";
type SolutionsProps = {
  solutions: Solution[];
  partners: SolutionPartner[];
};

export default function Solutions({ solutions, partners }: SolutionsProps) {
  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Solutions directory"
        title="Mental health solutions"
        subtitle="Explore the products, services, programmes, and technologies that support mental health, emotional wellbeing, and healthier communities and workplaces."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href="/apply/solution" className={buttonStyles({ size: "lg" })}>
            List your solution
          </Link>
          <a
            href="#solutions"
            className={buttonStyles({ variant: "outline", size: "lg" })}
          >
            Explore solutions
          </a>
        </div>
      </PageHero>

      <Container as="section" id="solutions" className="scroll-mt-24 pb-16">
        <SectionHeader
          title="Ways we can help"
          description="Each programme names how it runs, how long it takes, and who delivers it with us."
          underline
        />
        <SolutionsGrid solutions={solutions} className="mt-8" />
      </Container>

      <Container as="section" className="pb-20">
        <SectionHeader
          title="Delivered with our partners"
          description="Organisations we run programmes with. Logos are placeholders until the official files arrive."
        />
        <PartnerStrip partners={partners} className="mt-8" />
      </Container>
    </div>
  );
}
