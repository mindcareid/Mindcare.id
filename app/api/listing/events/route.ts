import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateEventSchema } from "@/lib/validations/auth";
import slugify from "slugify";
import z from "zod";
import { toUtc } from "@/lib/date";
import { EventPublisherType } from "@prisma/client";

type ListingType = "professional" | "care-centre";

function publisherTypeOf(type: ListingType): EventPublisherType {
  if (type === "professional") return EventPublisherType.PROFESSIONAL;
  return EventPublisherType.CARE_CENTRE;
}
async function findOwnListings(
  userId: number,
): Promise<{ type: ListingType; id: number }[]> {
  const [professional, membership] = await Promise.all([
    prisma.professional.findFirst({
      where: { userId, listingStatus: "LISTED", deletedAt: null },
      select: { id: true },
    }),
    prisma.careCentreUser.findFirst({
      where: { userId, status: "ACTIVE" },
      select: { centre: { select: { id: true } } },
    }),
  ]);

  const result: { type: ListingType; id: number }[] = [];
  if (professional) result.push({ type: "professional", id: professional.id });
  if (membership?.centre)
    result.push({ type: "care-centre", id: membership.centre.id });
  return result;
}
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user.id);
    const listings = await findOwnListings(userId);
    if (listings.length === 0) {
      return NextResponse.json(
        { message: "You need an approved listing to create events" },
        { status: 403 },
      );
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

    const parsed = CreateEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const {
      title,
      description,
      location,
      startDate,
      endDate,
      timeZone,
      price,
      quota,
      externalUrl,
      categoryId,
      coverImage,
      publicId,
      industryIds,
    } = parsed.data;

    const startDateUtc = toUtc(startDate, timeZone);
    const endDateUtc = toUtc(endDate, timeZone);
    const raw = body as Record<string, unknown>;
    const listingIndex =
      typeof raw.listingIndex === "number" ? raw.listingIndex : 0;
    const chosen =
      listingIndex >= 0 && listingIndex < listings.length
        ? listings[listingIndex]
        : listings[0];

    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let attempts = 0;
    while (attempts < 50) {
      const taken = await prisma.event.findFirst({
        where: { slug },
        select: { id: true },
      });
      if (!taken) break;
      attempts++;
      slug = `${baseSlug}-${attempts + 1}`;
    }

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        location: location || null,
        startDate: startDateUtc,
        endDate: endDateUtc,
        price: price ?? 0,
        quota: quota ?? null,
        externalUrl: externalUrl ?? null,
        coverImage: coverImage ?? null,
        publicId: publicId ?? null,
        isPublished: true,
        status: "PUBLISHED",
        publisherType: publisherTypeOf(chosen.type),
        professionalId: chosen.type === "professional" ? chosen.id : null,
        careCentreId: chosen.type === "care-centre" ? chosen.id : null,
        categoryId,
        createdById: userId,
        industries:
          industryIds && industryIds.length > 0
            ? { create: industryIds.map((industryId) => ({ industryId })) }
            : undefined,
      },
      include: {
        category: true,
        industries: { include: { industry: true } },
      },
    });

    return NextResponse.json(
      { message: "Event published", data: event },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CREATE_LISTING_EVENT]", error);
    return NextResponse.json(
      { message: "Failed to create event" },
      { status: 500 },
    );
  }
}
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type") as ListingType | null;
    const rawId = url.searchParams.get("id");
    const listingId = rawId ? Number(rawId) : null;

    if (!type || !listingId || !Number.isInteger(listingId) || listingId <= 0) {
      return NextResponse.json({ message: "Invalid query" }, { status: 400 });
    }

    const events = await prisma.event.findMany({
      where: {
        deletedAt: null,
        ...(type === "professional"
          ? { professionalId: listingId }
          : type === "care-centre"
            ? { careCentreId: listingId }
            : { careCentreId: 0 }),
      },
      orderBy: { startDate: "desc" },
      include: {
        category: true,
        industries: {
          select: { industry: { select: { id: true, name: true } } },
        },
        _count: { select: { orders: { where: { status: "PAID" } } } },
      },
    });

    return NextResponse.json({ data: events });
  } catch (error) {
    console.error("[GET_LISTING_EVENTS]", error);
    return NextResponse.json(
      { message: "Failed to load events" },
      { status: 500 },
    );
  }
}
