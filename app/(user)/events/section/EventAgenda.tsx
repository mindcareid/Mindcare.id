import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { MindcareEvent } from "../type/event";
import { formatEventTimeRange } from "../data/eventTime";

type EventAgendaProps = {
  event: MindcareEvent;
};

export default function EventAgenda({ event }: EventAgendaProps) {
  if (event.agenda.length === 0) return null;

  return (
    <div>
      {/* Keterangannya memakai rentang waktu acara yang sama dengan hero, dan
          jam di tiap baris di bawah HARUS berada di dalam rentang itu: baris
          pertama mulai persis di jam mulai, baris terakhir selesai persis di jam
          selesai, tanpa lubang di antaranya. Dijaga harness (invarian 25) karena
          keduanya `string` yang sah walau tidak cocok — `tsc` tidak akan pernah
          menangkap susunan acara yang berhenti sejam lebih awal. */}
      <SectionHeader
        title="Agenda"
        description={formatEventTimeRange(event)}
        underline
      />

      <ol className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {event.agenda.map((item) => (
          <li key={item.id} className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-6">
            {/* `time` string bebas ("09:00 – 09:30"), bukan timestamp — rundown
                internal tidak perlu dihitung apa pun, dan memaksanya jadi ISO
                berarti mengarang zona waktu per baris. Zona waktu acara sudah
                disebut sekali di keterangan section. `tabular-nums` supaya
                kolom jamnya tidak bergoyang antar baris. */}
            <p className="shrink-0 font-medium tabular-nums text-secondary sm:w-40">
              {item.time}
            </p>
            <p className="max-w-prose text-base leading-relaxed text-foreground">
              {item.title}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
