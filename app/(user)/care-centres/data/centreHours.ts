import type {
  CareCentre,
  CentreOpeningHours,
  CentreWeekday,
} from "../type/careCentre";
export const CENTRE_DAYS: CentreWeekday[] = [1, 2, 3, 4, 5, 6, 7];


export const WEEKDAY_LABELS: Record<CentreWeekday, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};
const ISO_WEEKDAY_BY_NAME: Record<string, CentreWeekday> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

type ZoneFormatters = {
  weekday: Intl.DateTimeFormat;
  time: Intl.DateTimeFormat;
  zone: Intl.DateTimeFormat;
};

const formatterCache = new Map<string, ZoneFormatters>();

function formattersFor(timeZone: string): ZoneFormatters {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;

  const formatters: ZoneFormatters = {
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone }),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    }),
    zone: new Intl.DateTimeFormat("id-ID", {
      timeZoneName: "short",
      timeZone,
    }),
  };

  formatterCache.set(timeZone, formatters);
  return formatters;
}

export function weekdayAt(centre: CareCentre, now: string): CentreWeekday {
  const name = formattersFor(centre.timeZone).weekday.format(new Date(now));
  return ISO_WEEKDAY_BY_NAME[name] ?? 1;
}

function localTimeAt(centre: CareCentre, now: string): string {
  return formattersFor(centre.timeZone).time.format(new Date(now));
}

export function hoursForWeekday(
  centre: CareCentre,
  day: CentreWeekday,
): CentreOpeningHours | null {
  return centre.openingHours.find((entry) => entry.day === day) ?? null;
}

export function isOpenAt(centre: CareCentre, now: string): boolean {
  const entry = hoursForWeekday(centre, weekdayAt(centre, now));
  if (!entry || entry.opens === null || entry.closes === null) return false;

  const time = localTimeAt(centre, now);
  return time >= entry.opens && time < entry.closes;
}

export function formatOpeningRange(entry: CentreOpeningHours): string {
  if (entry.opens === null || entry.closes === null) return "Closed";
  if (entry.opens === "00:00" && entry.closes === "24:00") {
    return "Open 24 hours";
  }
  return `${entry.opens} – ${entry.closes}`;
}

export function summariseTodayHours(centre: CareCentre, now: string): string {
  const entry = hoursForWeekday(centre, weekdayAt(centre, now));
  if (!entry || entry.opens === null || entry.closes === null) {
    return "Closed today";
  }
  return `Today ${formatOpeningRange(entry)}`;
}

const ZONE_LABEL_REFERENCE = new Date("2026-01-01T00:00:00.000Z");

export function centreZoneLabel(centre: CareCentre): string {
  return (
    formattersFor(centre.timeZone)
      .zone.formatToParts(ZONE_LABEL_REFERENCE)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
}
