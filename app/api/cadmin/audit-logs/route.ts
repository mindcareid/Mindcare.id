import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSuperadmin } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const superadmin = await getSuperadmin();
  if (!superadmin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  const actorId = Number(searchParams.get("actorId"));
  const entity = searchParams.get("entity")?.trim();
  const action = searchParams.get("action")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize")) || 20),
  );

  const where: Prisma.AuditLogWhereInput = {};
  if (Number.isFinite(actorId) && actorId > 0) where.actorId = actorId;
  if (entity) where.entity = entity;
  if (action) where.action = action;

  const createdAt: Prisma.DateTimeFilter = {};
  if (from) createdAt.gte = new Date(from);
  if (to) createdAt.lte = new Date(to);
  if (from || to) where.createdAt = createdAt;

  const [data, total, entityRows] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      distinct: ["entity"],
      select: { entity: true },
      orderBy: { entity: "asc" },
    }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    entities: entityRows.map((row) => row.entity),
  });
}
