import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { stripHtml } from "@/lib/utils/stripHtml";
import { getEventBySlug } from "@/lib/events/queries";

import EventDetailPage from "./EventDetail";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  const description = stripHtml(
    event.description ?? "",
  );


  return {
    title: event.title,
    description,

    openGraph: {
    title: event.title,
    description,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.slug}`,
    siteName: "Execorner",

    images: event.coverImage
      ? [
          {
            url: event.coverImage,
            width: 1200,
            height: 630,
            alt: event.title,
          },
        ]
      : [],

    type: "article",
  },
  };
}

export default async function Page({
  params,
}: Props) {
  const { slug } = await params;

  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <EventDetailPage
      event={event}
    />
  );
}