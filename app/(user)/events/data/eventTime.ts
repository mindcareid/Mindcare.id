import type { MindcareEvent } from "../type/event";

export function hasEnded(event: MindcareEvent, now: string) {
  return Date.parse(event.endDate) < Date.parse(now);
}

export function compareByStartAsc(a: MindcareEvent, b: MindcareEvent) {
  return Date.parse(a.startDate) - Date.parse(b.startDate);
}
