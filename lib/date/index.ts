import {
    fromZonedTime,
    toZonedTime,
} from "date-fns-tz";
import { formatInTimeZone } from "date-fns-tz";

export function toUtc(
    date: Date | string,
    timeZone: string,
) {
    return fromZonedTime(date, timeZone);
}

export function fromUtc(
    date: Date | string,
    timeZone: string,
) {
    return toZonedTime(date, timeZone);
}

export function fromUtcFormat(
  date: Date | string,
  timeZone: string,
): string {
  return formatInTimeZone(
    date,
    timeZone,
    "yyyy-MM-dd'T'HH:mm",
  );
}