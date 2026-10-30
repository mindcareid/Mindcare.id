import Link from "next/link";
import Container from "@/app/components/reusable/Container";
import PageHero from "@/app/components/reusable/PageHero";
import HeroWipeSlideshow, {
  type HeroSlide,
} from "@/app/components/reusable/HeroWipeSlideshow";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import HomeSection from "./section/HomeSection";
import ContactSection from "./section/ContactSection";
import ProfessionalsGrid from "../professionals/section/ProfessionalsGrid";
import CareCentresGrid from "../care-centres/section/CareCentresGrid";
import SolutionsGrid from "../solutions/section/SolutionsGrid";
import EventsCardGrid from "../events/section/EventsCardGrid";
import InsightsGrid from "../insights/section/InsightsGrid";
import type { Professional } from "../professionals/type/professional";
import type { CareCentre } from "../care-centres/type/careCentre";
import type { Solution } from "../solutions/type/solution";
import type { EventListItem } from "../events/data/events";
import type { Article } from "../insights/type/article";

type HomeProps = {
  professionals: Professional[];
  centres: CareCentre[];
  solutions: Solution[];
  events: EventListItem[];
  articles: Article[];
  now: string;
  heroSlides: HeroSlide[];
};

export default function Home({
  professionals,
  centres,
  solutions,
  events,
  articles,
  now,
  heroSlides,
}: HomeProps) {
  const heroActions = (
    <div className="flex flex-wrap gap-3">
      <Link href="/professionals" className={buttonStyles({ size: "lg" })}>
        Find a professional
      </Link>
      <Link
        href="/care-centres"
        className={buttonStyles({ variant: "outline", size: "lg" })}
      >
        Browse care centres
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen">
      {heroSlides.length > 0 ? (
        <HeroWipeSlideshow
          slides={heroSlides}
          eyebrow="MindCare.id"
          defaultTitle="Mental health support, all in one place"
          defaultDescription="Psychologists, psychiatrists, and counselling centres across Indonesia, together with the programmes, events, and articles that go with them."
          defaultActions={heroActions}
        />
      ) : (
        <PageHero
          eyebrow="MindCare.id"
          title="Mental health support, all in one place"
          subtitle="Psychologists, psychiatrists, and counselling centres across Indonesia, together with the programmes, events, and articles that go with them."
        >
          {heroActions}
        </PageHero>
      )}
      <HomeSection
        title="Meet the professionals"
        description="Psychologists, psychiatrists, and counsellors with the areas they support and the cities they practise in."
        href="/professionals"
      >
        <ProfessionalsGrid
          professionals={professionals}
          now={now}
          emptyState={{
            title: "No professionals listed yet",
            description:
              "Profiles appear here after they pass review. You can also browse the full directory.",
          }}
        />
      </HomeSection>

      <HomeSection
        title="Care centres near you"
        description="Clinics, hospitals, community health centres, and counselling centres that treat mental health."
        href="/care-centres"
      >
        <CareCentresGrid
          centres={centres}
          now={now}
          emptyState={{
            title: "No care centres listed yet",
            description:
              "Centres appear here once their listing is published. You can also browse the full directory.",
          }}
        />
      </HomeSection>

      <HomeSection
        title="Solutions"
        description="Structured solutions for individuals, workplaces, and communities."
        href="/solutions"
      >
        <SolutionsGrid
          solutions={solutions}
          emptyState={{
            title: "No solutions listed yet",
            description:
              "Published solutions appear here. You can also browse the full directory.",
          }}
        />
      </HomeSection>
      <HomeSection
        title="Upcoming events"
        description="Webinars, workshops, training, and support groups, online and in person."
        href="/events"
      >
        <EventsCardGrid
          events={events}
          now={now}
          emptyState={{
            title: "No upcoming events yet",
            description:
              "Events appear here as hosts publish them. You can also browse past and upcoming events.",
          }}
        />
      </HomeSection>

      {/* <HomeSection
        title="Latest articles"
        description="Written by the professionals listed in this directory."
        href="/insights"
      >
        <InsightsGrid articles={articles} />
      </HomeSection> */}

      <Container as="section" className="pb-20 pt-4">
        <div className="rounded-xl border border-border bg-brand-lavender-100 px-6 py-10 text-center md:px-10 md:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
            Join the directory
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-foreground">
            Are you a practitioner, centre, or solutions provider?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Psychologists, psychiatrists, care centres, and solutions providers
            can apply to be listed. Every application is reviewed before a
            listing goes live.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/apply/professional"
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              Apply as a professional
            </Link>
            <Link
              href="/apply/care-centre"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              Register a care centre
            </Link>
            {/* <Link
              href="/apply/solution"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              List a solution
            </Link> */}
          </div>
        </div>
      </Container>

      <ContactSection />
    </div>
  );
}
