import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticles } from "../../insights/data/articles";
import { getEvents } from "../../events/data/events";
import { compareByStartAsc, hasEnded } from "../../events/data/eventTime";
import {
  getProfessionalBySlug,
  getProfessionals,
  getRelatedProfessionals,
} from "../data/professionals";
import ProfessionalProfile from "./ProfessionalProfile";

type ProfessionalPageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const professionals = await getProfessionals();
  return professionals.map((professional) => ({ slug: professional.slug }));
}

export async function generateMetadata({
  params,
}: ProfessionalPageProps): Promise<Metadata> {
  const professional = await getProfessionalBySlug(params.slug);
  if (!professional) return { title: "Professional not found" };

  return {
    title: `${professional.fullName}, ${professional.credentials}`,
    description: professional.headline,
  };
}

export default async function ProfessionalPage({
  params,
}: ProfessionalPageProps) {
  const professional = await getProfessionalBySlug(params.slug);
  if (!professional) notFound();

  const now = new Date().toISOString();

  const [allArticles, allEvents, related] = await Promise.all([
    getArticles(),
    getEvents(),
    getRelatedProfessionals(professional.slug),
  ]);

  const articles = allArticles
    .filter((article) => article.author.professionalSlug === professional.slug)
    .slice(0, 3);

  const events = allEvents
    .filter(
      (event) =>
        event.host.kind === "professional" &&
        event.host.slug === professional.slug &&
        !hasEnded(event, now),
    )
    .sort(compareByStartAsc)
    .slice(0, 3);

  return (
    <ProfessionalProfile
      professional={professional}
      articles={articles}
      events={events}
      related={related}
      now={now}
    />
  );
}
