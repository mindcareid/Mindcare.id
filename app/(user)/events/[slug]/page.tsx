import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { getEventBySlug, getRelatedEvents } from "../data/events";

import EventDetail from "./EventDetail";
import { toEventPlainText } from "@/lib/events/serializers";

type EventPageProps = {
  params: {
    slug: string;
  };
};

/*
 * ============================================================
 * PAGE RENDERING
 * ============================================================
 *
 * Root layout memakai getServerSession (membaca cookie), jadi
 * route ini tidak boleh dipaksa statis. Dibiarkan dinamis agar
 * tidak muncul DYNAMIC_SERVER_USAGE di production.
 */

export const dynamic = "force-dynamic";

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