import type { MindcareEvent } from "../type/event";

export function hasEnded(event: MindcareEvent, now: string) {
  return Date.parse(event.endDate) < Date.parse(now);
}

export function compareByStartAsc(a: MindcareEvent, b: MindcareEvent) {
  return Date.parse(a.startDate) - Date.parse(b.startDate);
}

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type EventFormatters = {
  date: Intl.DateTimeFormat;
  dateLong: Intl.DateTimeFormat;
  time: Intl.DateTimeFormat;
  zone: Intl.DateTimeFormat;
};

const formatterCache = new Map<string, EventFormatters>();

function formattersFor(timeZone: string): EventFormatters {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;

  const formatters: EventFormatters = {
    date: new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone,
    }),
    dateLong: new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone,
    }),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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

function zoneLabelOf(formatters: EventFormatters, date: Date) {
  return (
    formatters.zone
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
}


export function formatEventDate(event: MindcareEvent) {
  return formattersFor(event.timeZone).date.format(new Date(event.startDate));
}

export function formatEventDateLong(event: MindcareEvent) {
  return formattersFor(event.timeZone).dateLong.format(
    new Date(event.startDate),
  );
}
export function formatEventStartTime(event: MindcareEvent) {
  const start = new Date(event.startDate);
  const formatters = formattersFor(event.timeZone);
  const time = formatters.time.format(start);
  const zone = zoneLabelOf(formatters, start);
  return zone === "" ? time : `${time} ${zone}`;
}
export function formatEventTimeRange(event: MindcareEvent) {
  const start = new Date(event.startDate);
  const formatters = formattersFor(event.timeZone);
  const range = `${formatters.time.format(start)} – ${formatters.time.format(
    new Date(event.endDate),
  )}`;
  const zone = zoneLabelOf(formatters, start);
  return zone === "" ? range : `${range} ${zone}`;
}

export function formatEventPrice(price: number) {
  return price === 0 ? "Free" : priceFormatter.format(price);
}

export function remainingSeatsOf(event: MindcareEvent) {
  return event.quota === null ? null : event.quota - event.registeredCount;
}

export type EventAvailability = {
  state: "ended" | "soldOut" | "open";
  label: string;
};

export function availabilityOf(
  event: MindcareEvent,
  now: string,
): EventAvailability {
  if (hasEnded(event, now)) return { state: "ended", label: "Event has ended" };

  const remaining = remainingSeatsOf(event);
  if (remaining !== null && remaining <= 0) {
    return { state: "soldOut", label: "Sold out" };
  }

  const price = formatEventPrice(event.price);
  if (remaining === null) return { state: "open", label: price };

  return {
    state: "open",
    label: `${price} · ${remaining} ${remaining === 1 ? "seat" : "seats"} left`,
  };
}
