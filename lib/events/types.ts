import { Prisma } from "@prisma/client";

/* =====================================================
 * Filter
 * ===================================================== */

export type EventType = "all" | "upcoming" | "ongoing" | "past";

export type EventPrice = "all" | "free" | "paid";

export interface GetEventsParams {
  search?: string;
  category?: string;
  industry?: string;
  type?: EventType;
  price?: EventPrice;
  page?: number;
  limit?: number;
}

/* =====================================================
 * Basic Models
 * ===================================================== */

export interface EventCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Industry {
  id: number;
  name: string;
  slug: string;
}

export interface CompanySummary {
  name: string;
  slug: string;
  logo: string | null;
  location: string | null;
  createdAt: Date;
}

export interface EventCategorySummary {
  name: string;
  slug: string;
}

/* =====================================================
 * Event
 * ===================================================== */

export interface EventCardItem {
  id: number;

  title: string;
  slug: string;

  location: string | null;
  timeZone: string;
  startDate: Date;
  endDate: Date;

  price: number;
  quota: number | null;
  externalUrl: string | null;

  coverImage: string | null;

  category: EventCategorySummary;
  remaining?: number | null;
  soldOut?: boolean;
}

export interface EventItem extends EventCardItem {
  description: string;

  company: CompanySummary;
  totalCompanyEvents: number | null;
  industries: {
    industry: Industry;
  }[];
}

/* =====================================================
 * Meta
 * ===================================================== */

export interface EventMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ApplyFiltersPayload = {
  category: string;
  industry: string;
  price: EventPrice;
  type: EventType;
};

/* =====================================================
 * Hook Filter
 * ===================================================== */

export interface EventFilters {
  search: string;
  category: string;
  industry: string;

  type: EventType;

  price: EventPrice;

  page: number;
}

/* =====================================================
 * API
 * ===================================================== */

export interface EventListResult<T> {
  data: T[];

  meta: EventMeta;
}

export type EventWhere = Prisma.EventWhereInput;
