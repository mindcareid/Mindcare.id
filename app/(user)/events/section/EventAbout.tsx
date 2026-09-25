import SectionHeader from "@/app/components/reusable/SectionHeader";

import type { EventDetail, EventListItem } from "../data/events";

type EventAboutProps = {
  event: EventDetail | EventListItem;
};

export default function EventAbout({ event }: EventAboutProps) {
  const paragraphs = event.description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <div>
      <SectionHeader title="About this event" underline />

      <div className="mt-6 max-w-prose space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${event.id}-about-${index}`}
            className="text-base leading-relaxed text-muted-foreground"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}