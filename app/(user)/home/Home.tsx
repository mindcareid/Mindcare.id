import Link from "next/link";
import PageHero from "@/app/components/reusable/PageHero";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import HomeSection from "./section/HomeSection";
import ProfessionalsGrid from "../professionals/section/ProfessionalsGrid";
import CareCentresGrid from "../care-centres/section/CareCentresGrid";
import SolutionsGrid from "../solutions/section/SolutionsGrid";
import EventsCardGrid from "../events/section/EventsCardGrid";
import InsightsGrid from "../insights/section/InsightsGrid";
import type { Professional } from "../professionals/type/professional";
import type { CareCentre } from "../care-centres/type/careCentre";
import type { Solution } from "../solutions/type/solution";
import type { MindcareEvent } from "../events/type/event";
import type { Article } from "../insights/type/article";

type HomeProps = {
  professionals: Professional[];
  centres: CareCentre[];
  solutions: Solution[];
  events: MindcareEvent[];
  articles: Article[];
  now: string;
};

export default function Home({
  professionals,
  centres,
  solutions,
  events,
  articles,
  now,
}: HomeProps) {
  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="MindCare.id"
        title="Mental health support, all in one place"
        subtitle="Psychologists, psychiatrists, and counselling centres across Indonesia — together with the programmes, events, and articles that go with them."
      >
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
      </PageHero>
      <HomeSection
        title="Meet the professionals"
        description="Psychologists, psychiatrists, and counsellors with the areas they support and the cities they practise in."
        href="/professionals"
      >
        <ProfessionalsGrid professionals={professionals} />
      </HomeSection>

      <HomeSection
        title="Care centres near you"
        description="Clinics, hospitals, community health centres, and counselling centres that treat mental health."
        href="/care-centres"
      >
        {/* `now` yang sama dengan yang dipakai kartu event di bawah — satu
            halaman, satu acuan waktu. Sejak 24 Agustus 2026 status "Open"
            dihitung dari jam praktik, jadi grid ini butuh waktunya. */}
        <CareCentresGrid centres={centres} now={now} />
      </HomeSection>

      <HomeSection
        title="Programmes and solutions"
        description="Structured programmes for individuals, workplaces, and communities."
        href="/solutions"
      >
        <SolutionsGrid solutions={solutions} />
      </HomeSection>
      <HomeSection
        title="Upcoming events"
        description="Webinars, workshops, training, and support groups — online and in person."
        href="/events"
      >
        <EventsCardGrid events={events} now={now} />
      </HomeSection>

      <HomeSection
        title="Latest articles"
        description="Written by the professionals listed in this directory."
        href="/insights"
        className="pb-20"
      >
        <InsightsGrid articles={articles} />
      </HomeSection>
    </div>
  );
}
