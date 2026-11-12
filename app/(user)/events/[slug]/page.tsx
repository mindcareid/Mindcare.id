import type { Metadata } from "next";

import { notFound } from "next/navigation";

import {
  getEventBySlug,
  getPublicEventSlugs,
  getRelatedEvents,
} from "../data/events";

import EventDetail from "./EventDetail";
import { toEventPlainText } from "@/lib/events/serializers";
import { EVENT_CACHE_REVALIDATE } from "@/lib/events/cache";

type EventPageProps = {
  params: {
    slug: string;
  };
};

export const revalidate = EVENT_CACHE_REVALIDATE;

/**
 * Pre-render slug publik saat build. DB bisa saja tidak terjangkau dari
 * environment build (atau query lambat/bermasalah), jadi kegagalan di
 * sini tidak boleh menggagalkan seluruh deploy: kembalikan array kosong
 * dan biarkan halaman dibuat on-demand lewat ISR.
 */
export async function generateStaticParams() {
  try {
    const slugs = await getPublicEventSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("[EVENT_STATIC_PARAMS]", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  // Paket sponsor tidak dipakai di metadata; jangan ikut di-query.
  const event = await getEventBySlug(params.slug, { withTiers: false });

  if (!event) {
    return {
      title: "Event Not Found | MindCare",
      description: "The event you are looking for could not be found.",
    };
  }

  const plainDescription = toEventPlainText(event.description);

  const description =
    plainDescription.length > 160
      ? `${plainDescription.slice(0, 157)}...`
      : plainDescription;

  return {
    title: `${event.title} | MindCare`,
    description,

    openGraph: {
      title: event.title,
      description,
      type: "website",
      ...(event.coverImage
        ? {
            images: [
              {
                url: event.coverImage,
                alt: event.title,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: event.coverImage ? "summary_large_image" : "summary",
      title: event.title,
      description,
      ...(event.coverImage
        ? {
            images: [event.coverImage],
          }
        : {}),
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }
  const now = new Date();
  const related = await getRelatedEvents(event.slug, 3, now);

  return (
    <EventDetail event={event} related={related} now={now.toISOString()} />
  );
}
