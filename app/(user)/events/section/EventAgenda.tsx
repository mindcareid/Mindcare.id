import SectionHeader from "@/app/components/reusable/SectionHeader";

import type { EventDetail } from "../data/events";

import {
  formatEventTimeRange,
} from "../data/eventTime";

type EventAgendaProps = {
  event: EventDetail;
};

function formatAgendaTime(
  startTime: Date,
  endTime: Date,
  timeZone: string,
): string {
  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  );

  const start = formatter.format(startTime);
  const end = formatter.format(endTime);

  return `${start} – ${end}`;
}

export default function EventAgenda({
  event,
}: EventAgendaProps) {
  if (event.agenda.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="event-agenda-title">
      <SectionHeader
        title="Agenda"
        description={formatEventTimeRange(event)}
        underline
      />

      <ol
        id="event-agenda-title"
        className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card"
      >
        {event.agenda.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-6"
          >
            <p className="shrink-0 font-medium tabular-nums text-secondary sm:w-40">
              {formatAgendaTime(
                item.startTime,
                item.endTime,
                event.timeZone,
              )}
            </p>

            <div className="max-w-prose">
              <p className="text-base leading-relaxed text-foreground">
                {item.title}
              </p>

              {item.description && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}