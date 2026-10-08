import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UpdateEventSchema } from "@/lib/validations/auth";
import z from "zod";
import { toUtc } from "@/lib/date";

type Params = { params: { id: string } };

const PUBLISHER_FIELDS = [
  "professionalId",
  "careCentreId",
  "solutionId",
] as const;

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "Invalid event id" },
        { status: 400 },
      );
    }

    const event = await prisma.event.findFirst({
      where: { id, deletedAt: null },
    });
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const isOwner = await verifyEventOwner(event, userId);
    if (!isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const parsed = UpdateEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.location !== undefined)
      updateData.location = data.location || null;
    if (data.startDate !== undefined)
      updateData.startDate = toUtc(data.startDate, event.timeZone);
    if (data.endDate !== undefined)
      updateData.endDate = toUtc(data.endDate, event.timeZone);
    if (data.timeZone !== undefined) updateData.timeZone = data.timeZone;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.quota !== undefined) updateData.quota = data.quota ?? null;
    if (data.externalUrl !== undefined)
      updateData.externalUrl = data.externalUrl || null;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.coverImage !== undefined)
      updateData.coverImage = data.coverImage || null;
    if (data.publicId !== undefined)
      updateData.publicId = data.publicId || null;
    if (data.isPublished !== undefined)
      updateData.isPublished = data.isPublished;
    if (data.industryIds !== undefined) {
      updateData.industries = {
        deleteMany: {},
        create: data.industryIds.map((industryId) => ({ industryId })),
      };
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        industries: { include: { industry: true } },
      },
    });

    return NextResponse.json({
      message: "Event updated",
      data: updated,
    });
  } catch (error) {
    console.error("[UPDATE_LISTING_EVENT]", error);
    return NextResponse.json(
      { message: "Failed to update event" },
      { status: 500 },
    );
  }
}

async function verifyEventOwner(
  event: {
    professionalId: number | null;
    careCentreId: number | null;
  },
  userId: number,
): Promise<boolean> {
  if (event.professionalId) {
    const owner = await prisma.professional.findFirst({
      where: {
        id: event.professionalId,
        userId,
        listingStatus: "LISTED",
        deletedAt: null,
      },
      select: { id: true },
    });
    return owner !== null;
  }

  if (event.careCentreId) {
    const owner = await prisma.careCentreUser.findFirst({
      where: {
        centreId: event.careCentreId,
        userId,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    return owner !== null;
  }

  return false;
}
