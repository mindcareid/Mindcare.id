import Container from "@/app/components/reusable/Container";
import PageHero from "@/app/components/reusable/PageHero";
import SectionHeader from "@/app/components/reusable/SectionHeader";
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
        eyebrow="Solutions"
        title="Support that fits the shape of the problem"
        subtitle="Programmes for individuals, workplaces, and communities — run by the psychologists, psychiatrists, and counsellors in our directory."
      />

      <Container as="section" className="pb-16">
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
