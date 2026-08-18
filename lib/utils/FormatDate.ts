import { formatInTimeZone } from "date-fns-tz";

const DEFAULT_TIMEZONE = "Asia/Jakarta";
const TZ_LABEL_OVERRIDE: Record<string, string> = {
  "Asia/Jakarta": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
};

const toDate = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (
  value?: string | Date | null,
  timeZone: string = DEFAULT_TIMEZONE,
) => {
  const date = toDate(value);
  if (!date) return "";
  return formatInTimeZone(date, timeZone, "dd MMMM yyyy");
};

export const formatDateShort = (
  value?: string | Date | null,
  timeZone: string = DEFAULT_TIMEZONE,
) => {
  const date = toDate(value);
  if (!date) return "";
  return formatInTimeZone(date, timeZone, "dd MMM");
};

export const formatTimeOnly = (
  value?: string | Date | null,
  timeZone: string = DEFAULT_TIMEZONE,
) => {
  const date = toDate(value);
  if (!date) return "";
  return formatInTimeZone(date, timeZone, "HH:mm");
};

export const getTimeZoneLabel = (
  value?: string | Date | null,
  timeZone: string = DEFAULT_TIMEZONE,
) => {
  if (TZ_LABEL_OVERRIDE[timeZone]) return TZ_LABEL_OVERRIDE[timeZone];

  const date = toDate(value) ?? new Date();
  return formatInTimeZone(date, timeZone, "zzz");
};

export const sameDate = (
  first?: string | Date | null,
  second?: string | Date | null,
  timeZone: string = DEFAULT_TIMEZONE,
) => {
  const d1 = toDate(first);
  const d2 = toDate(second);
  if (!d1 || !d2) return false;

  return (
    formatDateShort(d1, timeZone) === formatDateShort(d2, timeZone) &&
    d1.getFullYear() === d2.getFullYear()
  );
};
