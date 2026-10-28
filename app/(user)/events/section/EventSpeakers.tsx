import Image from "next/image";

import SectionHeader from "@/app/components/reusable/SectionHeader";

import type { EventDetail } from "../data/events";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

type EventSpeakersProps = {
  event: EventDetail;
};

/**
 * Daftar pembicara event MindCare.
 *
 * Tiap kartu punya `id="speaker-<id>"` yang dibidik oleh nama pembicara di
 * susunan acara. `scroll-mt-24` dipasang supaya anchor tidak mentok di tepi
 * atas viewport (pola yang sama dengan daftar isi artikel).
 */
export default function EventSpeakers({ event }: EventSpeakersProps) {
  if (event.publisherType !== "PLATFORM" || event.speakers.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="event-speakers-title">
      <div id="event-speakers-title">
        <SectionHeader title="Speakers" underline />
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {event.speakers.map((speaker) => {
          const roleLines = (speaker.titleLines ?? "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          return (
            <li
              key={speaker.id}
              id={`speaker-${speaker.id}`}
              className="scroll-mt-24 rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg bg-brand-lavender-200">
                {speaker.photoUrl ? (
                  <Image
                    src={speaker.photoUrl}
                    alt={speaker.name}
                    fill
                    // Ukuran asli dibatasi 600x750 (lihat ImageUploadField di
                    // form admin); ini hanya petunjuk srcset.
                    sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-heading text-2xl font-semibold text-secondary">
                    {initialsOf(speaker.name)}
                  </span>
                )}
              </div>

              <p className="mt-3 font-heading text-base font-semibold leading-snug text-foreground">
                {speaker.name}
              </p>

              {speaker.title && (
                <p className="mt-1 text-sm leading-snug text-muted-foreground">
                  {speaker.title}
                </p>
              )}

              {roleLines.length > 0 && (
                <ul className="mt-1 space-y-1 text-sm leading-snug text-muted-foreground">
                  {roleLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
