import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { MindcareEvent } from "../type/event";

type EventAboutProps = {
  event: MindcareEvent;
};

export default function EventAbout({ event }: EventAboutProps) {
  if (event.about.length === 0) return null;

  return (
    <div>
      <SectionHeader title="About this event" underline />

      {/* `about` sengaja array paragraf polos — sama seperti `Solution.overview`
          dan `Professional.bio` — supaya tidak mendahului keputusan format teks
          panjang yang masih terbuka di prd.md bagian 5. Warnanya
          `text-muted-foreground`, bukan `text-foreground` seperti badan artikel
          di Insights, karena isinya dua paragraf keterangan, bukan bacaan. */}
      <div className="mt-6 max-w-prose space-y-4">
        {event.about.map((paragraph, index) => (
          <p
            key={index}
            className="text-base leading-relaxed text-muted-foreground"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
