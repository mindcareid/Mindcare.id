export type EventFormat = "Online" | "In Person";
export type EventHostKind = "professional" | "centre";

export interface EventCategory {
  id: string;
  slug: string;
  name: string;
}

export interface EventFocusArea {
  id: string;
  slug: string;
  name: string;
}

export interface EventHost {
  kind: EventHostKind;
  slug: string;
  name: string;
  logoUrl: string | null;
}

export interface EventAgendaItem {
  id: string;
  time: string;
  title: string;
}

export interface MindcareEvent {
  id: string;
  slug: string;
  title: string;
  summary: string;
  about: string[];
  agenda: EventAgendaItem[];
  coverImage: string | null;
  location: string | null;
  timeZone: string;
  startDate: string;
  endDate: string;
  format: EventFormat;
  price: number;
  quota: number | null;
  registeredCount: number;
  category: EventCategory;
  focusAreas: EventFocusArea[];
  host: EventHost;
  createdAt: string;
}

export interface EventFacets {
  categories: EventCategory[];
  formats: EventFormat[];
}
