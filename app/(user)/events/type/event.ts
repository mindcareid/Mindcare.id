import type { EventFormat as PrismaEventFormat } from "@prisma/client";

export type EventFormat = PrismaEventFormat;

export interface EventCategory {
  id: number;
  slug: string;
  name: string;
}

export interface EventFocusArea {
  id: number;
  slug: string;
  name: string;
}

export interface EventHost {
  type: "PLATFORM" | "PROFESSIONAL" | "CARE_CENTRE" | "SOLUTION";
  name: string;
}

export interface EventAgendaItem {
  id: number;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  sortOrder: number;
}

export interface EventCardItem {
  id: number;
  slug: string;
  title: string;
  description: string;

  coverImage: string | null;
  location: string | null;

  timeZone: string;
  startDate: Date;
  endDate: Date;
  format: EventFormat;

  price: number;
  currency: string;
  quota: number | null;

  remaining: number | null;
  soldOut: boolean;

  category: EventCategory;
  focusAreas: EventFocusArea[];

  host: EventHost;

  createdAt: Date;
}

export interface EventFacets {
  categories: EventCategory[];
  formats: EventFormat[];
}