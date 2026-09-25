import type { Metadata } from "next";

import { notFound } from "next/navigation";

import {
  getEventBySlug,
  getEvents,
  getRelatedEvents,
} from "../data/events";

import EventDetail from "./EventDetail";

type EventPageProps = {
  params: {
    slug: string;
  };
};

/*
 * ============================================================
 * PAGE REVALIDATION
 * ============================================================
 *
 * Event page berisi informasi yang bergantung pada waktu:
 *
 * - event sudah berakhir atau belum
 * - availability
 * - tanggal event
 *
 * Revalidate setiap 1 jam untuk public directory.
 *
 * Jika nanti event memiliki ticketing / inventory real-time,
 * status availability jangan bergantung pada halaman yang
 * dicache.
 */

export const revalidate = 3600;

/*
 * ============================================================
 * STATIC PARAMS
 * ============================================================
 */

export async function generateStaticParams() {
  const events = await getEvents();

  return events.map((event) => ({
    slug: event.slug,
  }));
}

/*
 * ============================================================
 * METADATA
 * ============================================================
 */

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return {
      title: "Event Not Found | MindCare",
      description:
        "The event you are looking for could not be found.",
    };
  }

  const description =
    event.description.length > 160
      ? `${event.description.slice(0, 157)}...`
      : event.description;

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
      card: event.coverImage
        ? "summary_large_image"
        : "summary",
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

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default async function EventPage({
  params,
}: EventPageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  /*
   * Ambil waktu SATU KALI untuk seluruh render.
   *
   * Jangan membuat new Date() di masing-masing component.
   */
  const now = new Date();

  /*
   * Related events sudah menggunakan Date,
   * bukan string ISO.
   */
  const related = await getRelatedEvents(
    event.slug,
    3,
    now,
  );

  return (
    <EventDetail
      event={event}
      related={related}
      now={now.toISOString()}
    />
  );
}