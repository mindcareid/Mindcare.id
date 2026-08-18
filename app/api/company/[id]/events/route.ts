import { canManageEvent, getCompanyMember } from "@/lib/company-auth";
import prisma from "@/lib/prisma";
import { CreateEventSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";
import slugify from "slugify";
import z from "zod";
import { toUtc } from "@/lib/date";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const companyId = Number(params.id);
  if (isNaN(companyId)) {
    return NextResponse.json(
      { message: "Invalid Company Id" },
      { status: 400 },
    );
  }

  const member = await getCompanyMember(companyId);
  if (!member) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  try {
    const events = await prisma.event.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        category: true,
        industries: {
          select: {
            industry: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json({ data: events });
  } catch (error) {
    console.error("[GET_EVENTS]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const companyId = Number(params.id);
  if (isNaN(companyId)) {
    return NextResponse.json(
      { message: "Invalid Company Id" },
      { status: 400 },
    );
  }

  const member = await getCompanyMember(companyId);
  if (!member) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!canManageEvent(member.role)) {
    return NextResponse.json(
      { message: "Forbidden: Only OWNER or ADMIN Company can create events" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
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
    isPublished,
    industryIds,
  } = parsed.data;


  const startDateUtc = toUtc(
    startDate,
    timeZone,
  )

  const endDateUtc = toUtc(
    endDate,
    timeZone,
  )

  const baseSlug = slugify(title, { lower: true, strict: true });
  const slug = `${baseSlug}`;

  try {
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
        isPublished: isPublished ?? false,
        companyId,
        categoryId,
        industries: industryIds?.length
          ? {
            create: industryIds.map((industryId) => ({ industryId })),
          }
          : undefined,
      },
      include: {
        category: true,
        industries: {
          include: { industry: true },
        },
      },
    });

    return NextResponse.json(
      { message: "Event created successfully", data: event },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST_EVENT]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
