// lib/events/event.select.ts

import { Prisma } from "@prisma/client";

export const eventCardSelect = {
  id: true,
  title: true,
  slug: true,
  location: true,
  startDate: true,
  endDate: true,
  timeZone: true,
  price: true,
  quota: true,
  externalUrl: true,
  coverImage: true,

  category: {
    select: {
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.EventSelect;

export const eventListSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  location: true,
  startDate: true,
  endDate: true,
  timeZone: true,
  price: true,
  quota: true,
  externalUrl: true,
  coverImage: true,
  category: {
    select: {
      name: true,
      slug: true,
    },
  },

  company: {
    select: {
      name: true,
      slug: true,
      logo: true,
      location: true,
      createdAt: true,
    },
  },

  industries: {
    select: {
      industry: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.EventSelect;
