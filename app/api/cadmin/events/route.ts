import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
import { EventPublisherType, EventStatus } from "@prisma/client";
import { getAdminUser } from "@/lib/adminGuard";
import { PLATFORM_SLUG } from "@/lib/events/constants";
import { toUtc } from "@/lib/date";

function resolveTimeZone(body: Record<string, unknown>): string {
  return typeof body.timeZone === "string" && body.timeZone
    ? body.timeZone
    : "Asia/Jakarta";
}

async function getPlatformId(): Promise<number | null> {
  const platform = await prisma.platform.findUnique({
    where: { slug: PLATFORM_SLUG },
    select: { id: true },
  });

  return platform?.id ?? null;
}

function resolveStatus(body: Record<string, unknown>): EventStatus {
  const raw = body.status;

  if (typeof raw === "string" && raw in EventStatus) {
    return EventStatus[raw as keyof typeof EventStatus];
  }

  return body.isPublished === true ? EventStatus.PUBLISHED : EventStatus.DRAFT;
}

/* =========================
   GET - list / detail
========================= */
export async function GET(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // DETAIL
    if (id) {
      const event = await prisma.event.findFirst({
        where: {
          id: Number(id),
          deletedAt: null,
        },
        include: {
          category: true,
        },
      });

      if (!event) {
        return NextResponse.json(
          { success: false, message: "Event not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: event,
      });
    }

    // LIST
    const events = await prisma.event.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

/* =========================
   POST - create
========================= */
export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await req.json();

    const platformId = await getPlatformId();
    if (!platformId) {
      return NextResponse.json(
        { success: false, message: "Platform identity is not configured" },
        { status: 500 },
      );
    }

    const status = resolveStatus(body);
    const timeZone = resolveTimeZone(body);

    const event = await prisma.event.create({
      data: {
        title: body.title,
        slug: slugify(body.title, { lower: true }),
        description: body.description,
        location: body.location,
        startDate: toUtc(body.startDate, timeZone),
        endDate: toUtc(body.endDate, timeZone),
        timeZone,
        price: Number(body.price),
        quota: body.quota ? Number(body.quota) : null,
        categoryId: Number(body.categoryId),
        coverImage: body.coverImage,
        publicId: body.publicId,
        status,
        isPublished: status === EventStatus.PUBLISHED,
        publisherType: EventPublisherType.PLATFORM,
        platformId,
        createdById: admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create event" },
      { status: 500 },
    );
  }
}

/* =========================
   PUT - update
========================= */
export async function PUT(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const slug = body.slug;
    // slug unique check (exclude self)
    if (slug) {
      const slugUsed = await prisma.event.findFirst({
        where: {
          slug,
          NOT: { id: Number(id) },
        },
      });

      if (slugUsed) {
        return NextResponse.json(
          { message: "Slug already in use" },
          { status: 400 },
        );
      }
    }

    // Draft = disembunyikan dari publik. status & isPublished selalu
    // disimpan bersama supaya kedua jalur pembacaan publik konsisten.
    const status = resolveStatus(body);
    const timeZone = resolveTimeZone(body);

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        slug,
        description: body.description,
        location: body.location,
        startDate: toUtc(body.startDate, timeZone),
        endDate: toUtc(body.endDate, timeZone),
        timeZone,
        price: Number(body.price),
        quota: body.quota ? Number(body.quota) : null,
        categoryId: Number(body.categoryId),
        coverImage: body.coverImage,
        publicId: body.publicId,
        status,
        isPublished: status === EventStatus.PUBLISHED,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update event" },
      { status: 500 },
    );
  }
}

/* =========================
   DELETE - soft delete
========================= */
export async function DELETE(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Event id is required" },
        { status: 400 },
      );
    }

    await prisma.event.update({
      where: { id: Number(id) },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete event" },
      { status: 500 },
    );
  }
}
