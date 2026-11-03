import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import {
  PAGE_SIZE,
  type ProposalDownloadFilters,
} from "@/lib/cadmin/proposalDownloads.shared";
import { PROPOSAL_EVENT_WHERE } from "@/lib/events/proposal";

export function buildWhere(
  filters: ProposalDownloadFilters,
): Prisma.EventProposalDownloadWhereInput {
  const where: Prisma.EventProposalDownloadWhereInput = {
    event: PROPOSAL_EVENT_WHERE,
  };

  if (filters.eventId) {
    where.eventId = filters.eventId;
  }

  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search } },
      { email: { contains: filters.search } },
      { institution: { contains: filters.search } },
      { eventName: { contains: filters.search } },
    ];
  }

  return where;
}

/** Event platform untuk dropdown filter. */
export async function listPlatformEvents() {
  return prisma.event.findMany({
    where: PROPOSAL_EVENT_WHERE,
    select: { id: true, title: true, startDate: true },
    orderBy: { startDate: "desc" },
  });
}

export const DOWNLOAD_SELECT = {
  id: true,
  eventId: true,
  eventName: true,
  fullName: true,
  email: true,
  phone: true,
  institution: true,
  position: true,
  source: true,
  documentWarning: true,
  status: true,
  emailSentAt: true,
  emailError: true,
  createdAt: true,
  event: { select: { title: true, startDate: true } },
} satisfies Prisma.EventProposalDownloadSelect;

export type DownloadRow = Prisma.EventProposalDownloadGetPayload<{
  select: typeof DOWNLOAD_SELECT;
}>;

export async function loadDownloads(
  filters: ProposalDownloadFilters,
  options: { take?: number; skip?: number } = {},
): Promise<{ rows: DownloadRow[]; total: number }> {
  const where = buildWhere(filters);
  const take = options.take ?? PAGE_SIZE;
  const skip = options.skip ?? (filters.page - 1) * PAGE_SIZE;

  const [total, rows] = await Promise.all([
    prisma.eventProposalDownload.count({ where }),
    prisma.eventProposalDownload.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: DOWNLOAD_SELECT,
    }),
  ]);

  return { rows, total };
}

/** Versi keyset untuk export besar: tidak memakai OFFSET yang makin lambat. */
export async function* iterateDownloads(
  filters: ProposalDownloadFilters,
  batchSize = 500,
): AsyncGenerator<DownloadRow> {
  const where = buildWhere(filters);
  let lastCreatedAt: Date | null = null;
  let lastId: number | null = null;

  while (true) {
    const cursorWhere: Prisma.EventProposalDownloadWhereInput =
      lastCreatedAt && lastId !== null
        ? {
            AND: [
              where,
              {
                OR: [
                  { createdAt: { lt: lastCreatedAt } },
                  { createdAt: lastCreatedAt, id: { lt: lastId } },
                ],
              },
            ],
          }
        : where;

    const batch = await prisma.eventProposalDownload.findMany({
      where: cursorWhere,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: batchSize,
      select: DOWNLOAD_SELECT,
    });

    if (batch.length === 0) return;

    for (const row of batch) {
      yield row;
    }

    const last = batch[batch.length - 1];
    lastCreatedAt = last.createdAt;
    lastId = last.id;

    if (batch.length < batchSize) return;
  }
}
