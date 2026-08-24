import Container from "@/app/components/reusable/Container";
import PageHero from "@/app/components/reusable/PageHero";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import InsightsGrid from "./section/InsightsGrid";
import type { Article } from "./type/article";


type InsightsProps = {
  articles: Article[];
};

export default function Insights({ articles }: InsightsProps) {
  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Insights"
        title="Reading that helps you make sense of what you feel"
        subtitle="Articles written by psychologists, psychiatrists, and counsellors in our directory, and reviewed before they are published."
      />

      <Container as="section" className="pb-20">
        <SectionHeader
          title="Latest articles"
          description="Newest first. Every piece names the person who wrote it and the clinician who reviewed it."
          underline
        />

        <InsightsGrid articles={articles} className="mt-8" />
      </Container>
    </div>
  );
}
