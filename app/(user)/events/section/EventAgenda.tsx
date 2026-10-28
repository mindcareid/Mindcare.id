import Link from "next/link";

import SectionHeader from "@/app/components/reusable/SectionHeader";

import type { EventDetail } from "../data/events";

import { formatEventTimeRange } from "../data/eventTime";
import {
  AGENDA_SPEAKER_ROLES,
  agendaKindLabel,
} from "@/lib/events/agenda";

type EventAgendaProps = {
  event: EventDetail;
  /**
   * `false` kalau daftar speaker tidak dirender (mis. event sudah lewat).
   * Nama pembicara lalu tampil sebagai teks, bukan tautan yang menggulir ke
   * tempat yang tidak ada.
   */
  linkSpeakers?: boolean;
};

/**
 * Susunan acara, dikelompokkan per hari (design.md bagian 33.7).
 *
 * Alasan bentuknya begini, satu baris per keputusan:
 * - Hari jadi pemisah pertama: orang mencari "hari apa" sebelum "jam berapa",
 *   dan tanggal per sesi yang diisi admin sebelumnya tidak pernah tampil.
 * - Jam rata kanan dalam kolom tetap supaya mata bisa memindai urutan waktu
 *   tanpa membaca judul.
 * - Garis tipis dari jam ke isi menyatukan keduanya jadi satu baris baca,
 *   menggantikan pemisah antarbaris yang memutus hubungan itu.
 * - Jenis sesi ditulis kecil di atas judul, bukan label UPPERCASE bertracking
 *   lebar: nama jenisnya sudah jelas ("Keynote speech"), jadi tidak perlu
 *   diperbesar suaranya.
 */
function formatDayHeading(dateKey: string, timeZone: string): string {
  // `dateKey` adalah `YYYY-MM-DD` di zona acara. Dijadikan tengah hari UTC
  // supaya pembacaan tanggal tidak bergeser ke hari sebelumnya.
  const date = new Date(`${dateKey}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) return "Date not set";

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(date);
}

function formatClock(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** `YYYY-MM-DD` di zona acara. */
function dayKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function EventAgenda({
  event,
  linkSpeakers = true,
}: EventAgendaProps) {
  if (event.agenda.length === 0) {
    return null;
  }

  // Detail jenis sesi dan daftar pembicara hanya milik event MindCare. Event
  // profesional/care centre tetap tampil seperti sebelumnya.
  const isPlatform = event.publisherType === "PLATFORM";

  // Kelompokkan per hari, urut naik. Sesi tanpa tanggal valid masuk grup
  // terakhir supaya tidak mendorong jadwal yang sudah pasti ke bawah.
  const groups = new Map<string, typeof event.agenda>();

  for (const item of event.agenda) {
    const key = dayKey(item.startTime, event.timeZone);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  const days = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    // Tidak memakai `aria-labelledby`: `SectionHeader` tidak menerima `id`,
    // dan menunjuk elemen tanpa `id` membuat sebagian pembaca layar
    // mengumumkan region tanpa nama. `section` tetap punya heading di dalamnya.
    <section>
      <SectionHeader
        title="Agenda"
        description={formatEventTimeRange(event)}
        underline
      />

      <div className="mt-6 space-y-8">
        {days.map(([dateKey, items]) => (
          <div key={dateKey}>
            <h3 className="font-heading text-base font-semibold text-foreground">
              {formatDayHeading(dateKey, event.timeZone)}
            </h3>

            <ol className="mt-3 space-y-0">
              {items.map((item, index) => {
                type SpeakerLink = {
                  speaker: (typeof event.speakers)[number];
                  role: string;
                };

                const speakerLinks: SpeakerLink[] = isPlatform
                  ? item.speakers
                      .map((link) => {
                        const speaker = event.speakers.find(
                          (entry) => entry.id === link.speakerId,
                        );
                        return speaker ? { speaker, role: link.role } : null;
                      })
                      .filter((entry): entry is SpeakerLink => entry !== null)
                  : [];

                const canLinkSpeakers =
                  linkSpeakers && event.speakers.length > 0;

                // Urutan peran mengikuti daftar peran, bukan urutan acak dari
                // database, supaya "Moderator" selalu sebelum "Speaker".
                const speakerGroups = AGENDA_SPEAKER_ROLES.map((role) => ({
                  label: role.publicLabel,
                  people: speakerLinks
                    .filter((entry) => entry.role === role.value)
                    .map((entry) => entry.speaker),
                })).filter((group) => group.people.length > 0);

                const kindLabel = isPlatform
                  ? agendaKindLabel(item.kind)
                  : "";
                const isLast = index === items.length - 1;

                return (
                  <li key={item.id} className="flex gap-4">
                    {/* Kolom jam: lebar tetap supaya semua baris sejajar. */}
                    <p className="w-14 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-foreground">
                      {formatClock(item.startTime, event.timeZone)}
                    </p>

                    {/* Garis penghubung jam ke isi; berhenti di baris terakhir
                        hari itu supaya tidak menggantung. */}
                    <div className="flex shrink-0 flex-col items-center">
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 rounded-full bg-secondary"
                      />
                      {!isLast && (
                        <span
                          aria-hidden="true"
                          className="w-px flex-1 bg-border"
                        />
                      )}
                    </div>

                    <div className="min-w-0 pb-6">
                      {/* Jenis sesi dan jam selesai dipisah dua elemen, bukan
                          digabung dengan titik: "Opening · 09:10" terbaca
                          sebagai satu label yang membingungkan. Jenis sesi
                          dapat warnanya sendiri (accent), jam selesai tetap
                          redup karena sudah ada jam mulai di kolom kiri. */}
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                        {kindLabel && (
                          <span className="font-semibold text-brand-emerald-700">
                            {kindLabel}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          until {formatClock(item.endTime, event.timeZone)}
                        </span>
                      </p>

                      <p className="mt-0.5 text-base font-semibold leading-snug text-foreground">
                        {item.title}
                      </p>

                      {speakerGroups.length > 0 ? (
                        <dl className="mt-1.5 space-y-0.5 text-sm leading-relaxed text-muted-foreground">
                          {speakerGroups.map((group) => (
                            <div key={group.label}>
                              <dt className="inline text-muted-foreground">
                                {group.label}
                                {": "}
                              </dt>
                              <dd className="inline">
                                {group.people.map((speaker, personIndex) => (
                                  <span key={speaker.id}>
                                    {personIndex > 0 && ", "}
                                    {canLinkSpeakers ? (
                                      <Link
                                        href={`#speaker-${speaker.id}`}
                                        className="rounded-sm font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                                      >
                                        {speaker.name}
                                      </Link>
                                    ) : (
                                      <span className="font-medium text-foreground">
                                        {speaker.name}
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      ) : (
                        item.attendees && (
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            {item.attendees}
                          </p>
                        )
                      )}

                      {item.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
