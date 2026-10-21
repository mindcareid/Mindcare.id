import Home from "./home/Home";
import prisma from "@/lib/prisma";
import { getProfessionals } from "./professionals/data/professionals";
import { getCareCentres } from "./care-centres/data/careCentres";
import { getSolutions } from "./solutions/data/solutions";
import { getUpcomingEvents } from "./events/data/events";
import { getArticles } from "./insights/data/articles";
const HOME_SECTION_LIMIT = 3;
export const revalidate = 300;

export default async function UserPage() {
  const now = new Date();
  const nowIso = now.toISOString();

  const [professionals, centres, solutions, events, articles] =
    await Promise.all([
      getProfessionals(),
      getCareCentres(),
      getSolutions(),
      getUpcomingEvents(HOME_SECTION_LIMIT, now),
      getArticles(),
    ]);

  const heroSliders = await prisma.heroSlider.findMany({
    where: { isActive: true, image: { not: null } },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  const heroSlides = heroSliders.map((slider) => ({
    src: slider.image as string,
    alt: slider.subtitle ?? slider.title ?? "Mindcare",
    title: slider.title ?? undefined,
    description: slider.description ?? undefined,
    ctaText: slider.buttonText ?? undefined,
    ctaHref: slider.buttonUrl ?? undefined,
  }));

  return (
    <Home
      professionals={professionals.slice(0, HOME_SECTION_LIMIT)}
      centres={centres.slice(0, HOME_SECTION_LIMIT)}
      solutions={solutions.slice(0, HOME_SECTION_LIMIT)}
      events={events}
      articles={articles.slice(0, HOME_SECTION_LIMIT)}
      now={nowIso}
      heroSlides={heroSlides}
    />
  );
}
