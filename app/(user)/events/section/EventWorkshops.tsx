import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Clock, Tag, ArrowRight } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";
import type { EventDetail } from "../data/events";
import { FormatDayHeading, FormatClock, DayKey } from "@/lib/utils/Time";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

type EventWorkshopsProps = {
  event: EventDetail;
};

export default function EventWorkshops({ event }: EventWorkshopsProps) {
  if (
    event.publisherType !== "PLATFORM" ||
    !event.workshops ||
    event.workshops.length === 0
  ) {
    return null;
  }

  // Find the first workshop that has a registration link
  const registrationLink = event.workshops.find((w) => w.link)?.link ?? null;

  // Group sessions by day (supports multi-day events)
  const groups = new Map<string, typeof event.workshops>();
  for (const item of event.workshops) {
    const key = DayKey(item.startTime, event.timeZone);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  const days = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <section aria-labelledby="event-workshops-title" className="scroll-mt-20">
      <div id="event-workshops-title">
        <SectionHeader title="Workshop" underline />
      </div>

      {/* Session list */}
      <div className="mt-6 space-y-10">
        {days.map(([dateKey, items], dayIdx) => (
          <div key={dateKey}>
            {days.length > 1 && (
              <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {FormatDayHeading(dateKey, event.timeZone)}
              </h3>
            )}

            <div className="space-y-3">
              {items.map((workshop, idx) => {
                const speaker = workshop.speaker;
                const timeStart = FormatClock(
                  workshop.startTime,
                  event.timeZone,
                );
                const timeEnd = FormatClock(workshop.endTime, event.timeZone);
                const sessionNum = dayIdx * items.length + idx + 1;

                return (
                  <article
                    key={workshop.id}
                    className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:gap-6"
                  >
                    {/* Session number indicator */}
                    <div
                      aria-hidden="true"
                      className="hidden shrink-0 items-start pt-0.5 sm:flex"
                    >
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {sessionNum}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-3">
                      {/* Time & price badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 font-medium tabular-nums text-foreground">
                          <Clock
                            className="size-3.5 text-muted-foreground"
                            aria-hidden="true"
                          />
                          {timeStart} &ndash; {timeEnd}
                        </span>

                        {workshop.price && (
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-emerald-200 bg-brand-emerald-50 px-2.5 py-1 font-semibold text-brand-emerald-800 dark:border-brand-emerald-900/40 dark:bg-brand-emerald-950/40 dark:text-brand-emerald-300">
                            <Tag className="size-3.5" aria-hidden="true" />
                            {workshop.price}
                          </span>
                        )}
                      </div>

                      {/* Title & description */}
                      <div>
                        <h4 className="font-heading text-base font-semibold leading-snug text-foreground sm:text-lg">
                          {workshop.title}
                        </h4>
                        {workshop.description && (
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            {workshop.description}
                          </p>
                        )}
                      </div>

                      {/* Speaker profile */}
                      {speaker && (
                        <div className="flex items-center gap-1 pt-0.5">
                          <div className="min-w-0 text-sm">
                            <Link
                              href={`#speaker-${speaker.id}`}
                              className="font-medium text-foreground hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            >
                              {speaker.name}
                            </Link>
                            {speaker.title && (
                              <p className="truncate text-xs text-muted-foreground">
                                {speaker.title}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {registrationLink && (
        <div className="mt-8 overflow-hidden rounded-xl border-2 border-primary/20 bg-primary/5 p-6 dark:border-primary/30 dark:bg-primary/10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-heading text-base font-semibold text-foreground">
                Investment &amp; Registration
              </p>
              {event.workshopNote ? (
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {event.workshopNote}
                </p>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Register now and secure your spot before it's full.
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="shrink-0">
              <a
                href={registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({
                  variant: "primary",
                  size: "md",
                  className: "w-full gap-2 sm:w-auto",
                })}
              >
                <span>Register Now</span>
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
