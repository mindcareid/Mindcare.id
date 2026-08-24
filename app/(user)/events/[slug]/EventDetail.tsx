import { Info } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { CareCentre } from "../../care-centres/type/careCentre";
import type { Professional } from "../../professionals/type/professional";
import EventAbout from "../section/EventAbout";
import EventAgenda from "../section/EventAgenda";
import EventHero from "../section/EventHero";
import EventHostCard from "../section/EventHostCard";
import EventsCardGrid from "../section/EventsCardGrid";
import type { MindcareEvent } from "../type/event";
import { hasEnded } from "../data/eventTime";

type EventDetailProps = {
  event: MindcareEvent;
  host: {
    professional: Professional | null;
    centre: CareCentre | null;
  };
  related: MindcareEvent[];
  /** Ditetapkan sekali di server lalu diturunkan — lihat catatan di page.tsx. */
  now: string;
};

export default function EventDetail({
  event,
  host,
  related,
  now,
}: EventDetailProps) {
  const ended = hasEnded(event, now);

  return (
    <div className="min-h-screen">
      <EventHero event={event} now={now} />

      <Container className="pb-16 md:pb-24">
        <div className="space-y-14 md:space-y-16">
          <EventAbout event={event} />

          <EventAgenda event={event} />

          <EventHostCard
            host={event.host}
            professional={host.professional}
            centre={host.centre}
          />

          {/* Catatan ini berubah menurut keadaan acara, bukan satu kalimat untuk
              semua. Halaman acara yang sudah lewat tetap bisa dibuka (tautan
              lama, hasil pencarian), dan di situ yang perlu diberitahu bukan
              "susunan acara bisa berubah" melainkan "ini sudah berlangsung". */}
          <div className="flex max-w-prose gap-3 rounded-xl border border-border bg-brand-mint-100 p-5">
            <Info
              className="mt-0.5 size-5 shrink-0 text-accent"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-foreground">
              {ended
                ? "Acara ini sudah berlangsung. Halamannya dibiarkan terbuka sebagai catatan; kalau ingin ikut acara serupa berikutnya, hubungi kami."
                : "Susunan acara di halaman ini rencana, bukan jadwal yang kaku — urutan dan durasinya bisa bergeser di hari pelaksanaan. Jumlah kursi yang tersisa diperbarui manual, jadi mohon konfirmasi ketersediaannya saat menghubungi kami."}
            </p>
          </div>

          {related.length > 0 && (
            <div>
              <SectionHeader title="More events" href="/events" underline />
              <EventsCardGrid events={related} now={now} className="mt-6" />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
