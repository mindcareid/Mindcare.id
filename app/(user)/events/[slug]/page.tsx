import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCareCentreBySlug } from "../../care-centres/data/careCentres";
import { getProfessionalBySlug } from "../../professionals/data/professionals";
import { getEventBySlug, getEvents, getRelatedEvents } from "../data/events";
import EventDetail from "./EventDetail";

type EventPageProps = {
  params: { slug: string };
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: "Event not found" };

  return {
    title: event.title,
    description: event.summary,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);
  if (!event) notFound();
  const now = new Date().toISOString();
  const [professional, centre, related] = await Promise.all([
    event.host.kind === "professional"
      ? getProfessionalBySlug(event.host.slug)
      : Promise.resolve(null),
    event.host.kind === "centre"
      ? getCareCentreBySlug(event.host.slug)
      : Promise.resolve(null),
    getRelatedEvents(event.slug, now),
  ]);

  return (
    <EventDetail
      event={event}
      host={{ professional, centre }}
      related={related}
      now={now}
    />
  );
}
