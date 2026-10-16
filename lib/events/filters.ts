import { Prisma } from "@prisma/client";
import { GetEventsParams } from "./types";

export function buildEventWhere(
  params: GetEventsParams,
): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {
    deletedAt: null,
    //isPublished: true,
  };

  if (params.search?.trim()) {
    where.title = {
      contains: params.search.trim(),
    };
  }

  if (params.category) {
    where.category = {
      slug: params.category,
    };
  }

  if (params.price === "free") {
    where.price = {
      equals: 0,
    };
  }

  if (params.price === "paid") {
    where.price = {
      gt: 0,
    };
  }

  const now = new Date();

  switch (params.type) {
    case "upcoming":
      where.startDate = {
        gte: now,
      };
      break;

    case "ongoing":
      where.startDate = {
        lte: now,
      };

      where.endDate = {
        gte: now,
      };

      break;

    case "past":
      where.endDate = {
        lt: now,
      };
      break;
  }

  if (params.industry) {
    where.industries = {
      some: {
        industry: {
          slug: params.industry,
        },
      },
    };
  }

  return where;
}
