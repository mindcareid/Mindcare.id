import Link from "next/link";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import type { EventDetail } from "../data/events";
import { formatEventTimeRange } from "../data/eventTime";
import { FormatDayHeading, FormatClock, DayKey } from "@/lib/utils/Time";
import { AGENDA_SPEAKER_ROLES, agendaKindLabel } from "@/lib/events/agenda";

type EventAgendaProps = {
  event: EventDetail;
  linkSpeakers?: boolean;
};

export default function EventAgenda({
  event,
  linkSpeakers = true,
}: EventAgendaProps) {
  if (event.agenda.length === 0) {
    return null;
  }
  const isPlatform = event.publisherType === "PLATFORM";
  const groups = new Map<string, typeof event.agenda>();

  for (const item of event.agenda) {
    const key = DayKey(item.startTime, event.timeZone);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  const days = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <section>
      <SectionHeader
        title="Schedule"
        // description={formatEventTimeRange(event)}
        underline
      />

      <div className="mt-6 space-y-8">
        {days.map(([dateKey, items]) => (
          <div key={dateKey}>
            <h3 className="font-heading text-base font-semibold text-foreground">
              {FormatDayHeading(dateKey, event.timeZone)}
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
                const speakerGroups = AGENDA_SPEAKER_ROLES.map((role) => ({
                  label: role.publicLabel,
                  people: speakerLinks
                    .filter((entry) => entry.role === role.value)
                    .map((entry) => entry.speaker),
                })).filter((group) => group.people.length > 0);

                const kindLabel = isPlatform ? agendaKindLabel(item.kind) : "";
                const isLast = index === items.length - 1;

                return (
                  <li key={item.id} className="flex gap-4">
                    <p className="w-14 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-foreground">
                      {FormatClock(item.startTime, event.timeZone)}
                    </p>
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
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                        {kindLabel && (
                          <span className="font-semibold text-brand-emerald-700">
                            {kindLabel}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          until {FormatClock(item.endTime, event.timeZone)}
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
