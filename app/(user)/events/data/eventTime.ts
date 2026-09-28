import type { EventDetail } from "../data/events";

type EventWithDates = Pick<EventDetail, "startDate" | "endDate">;

type EventWithAvailability = Pick<
  EventDetail,
  "startDate" | "endDate" | "timeZone" | "price" | "quota"
> & {
  registeredCount: number;
};

/**
 * Check whether an event has ended.
 */
export function hasEnded(
  event: EventWithDates,
  now: string | Date,
): boolean {
  const currentTime =
    now instanceof Date ? now.getTime() : new Date(now).getTime();

  return event.endDate.getTime() <= currentTime;
}

/**
 * Compare events by start date ascending.
 */
export function compareByStartAsc(
  a: EventWithDates,
  b: EventWithDates,
): number {
  return a.startDate.getTime() - b.startDate.getTime();
}

// -----------------------------------------------------------------------------
// Date & time formatting
// -----------------------------------------------------------------------------

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

  if (cached) {
    return cached;
  }

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

function zoneLabelOf(
  formatters: EventFormatters,
  date: Date,
): string {
  return (
    formatters.zone
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
}

/**
 * "27 Aug 2026"
 */
export function formatEventDate(
  event: Pick<EventDetail, "startDate" | "timeZone">,
): string {
  return formattersFor(event.timeZone).date.format(event.startDate);
}

/**
 * "Thursday, 27 August 2026"
 */
export function formatEventDateLong(
  event: Pick<EventDetail, "startDate" | "timeZone">,
): string {
  return formattersFor(event.timeZone).dateLong.format(event.startDate);
}

/**
 * "19:00 WIB"
 */
export function formatEventStartTime(
  event: Pick<EventDetail, "startDate" | "timeZone">,
): string {
  const start = event.startDate;
  const formatters = formattersFor(event.timeZone);

  const time = formatters.time.format(start);
  const zone = zoneLabelOf(formatters, start);

  return zone === "" ? time : `${time} ${zone}`;
}

/**
 * "19:00 – 20:30 WIB"
 */
export function formatEventTimeRange(
  event: Pick<EventDetail, "startDate" | "endDate" | "timeZone">,
): string {
  const start = event.startDate;
  const end = event.endDate;

  const formatters = formattersFor(event.timeZone);

  const range = `${formatters.time.format(start)} – ${formatters.time.format(
    end,
  )}`;

  const zone = zoneLabelOf(formatters, start);

  return zone === "" ? range : `${range} ${zone}`;
}

/**
 * "Free" or "Rp350.000"
 */
export function formatEventPrice(price: number): string {
  return price === 0 ? "Free" : priceFormatter.format(price);
}

// -----------------------------------------------------------------------------
// Availability
// -----------------------------------------------------------------------------

/**
 * null means unlimited seats.
 */
export function remainingSeatsOf(
  event: Pick<EventDetail, "quota"> & {
    registeredCount: number;
  },
): number | null {
  if (event.quota === null) {
    return null;
  }

  return Math.max(event.quota - event.registeredCount, 0);
}

export type EventAvailability = {
  state: "ended" | "soldOut" | "open";
  label: string;
};

export function availabilityOf(
  event: EventWithAvailability,
  now: string | Date,
): EventAvailability {
  if (hasEnded(event, now)) {
    return {
      state: "ended",
      label: "Event has ended",
    };
  }

  const remaining = remainingSeatsOf(event);

  if (remaining !== null && remaining <= 0) {
    return {
      state: "soldOut",
      label: "Sold out",
    };
  }

  const price = formatEventPrice(event.price);

  if (remaining === null) {
    return {
      state: "open",
      label: price,
    };
  }

  return {
    state: "open",
    label: `${price} · ${remaining} ${
      remaining === 1 ? "seat" : "seats"
    } left`,
  };
}