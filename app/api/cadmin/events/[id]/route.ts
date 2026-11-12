import { getAdminUser } from "@/lib/adminGuard";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { EventStatus } from "@prisma/client";
import { parseProposal } from "@/lib/events/proposalInput";
import { revalidateEventCache } from "@/lib/events/cache";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { id: Number(id), deletedAt: null },
    include: {
      category: true,
      // Speaker & agenda dibutuhkan form edit admin (design.md bagian 33).
      speakers: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      agenda: {
        orderBy: [{ sortOrder: "asc" }, { startTime: "asc" }],
        include: {
          speakers: {
            orderBy: { sortOrder: "asc" },
            select: { speakerId: true },
          },
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ message: "Event not found!" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: event });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const isPublished = body?.isPublished === true;

  const event = await prisma.event.update({
    where: { id: Number(id) },
    data: {
      isPublished,
      status: isPublished ? EventStatus.PUBLISHED : EventStatus.DRAFT,
    },
    select: { id: true, slug: true, isPublished: true, status: true },
  });
  revalidateEventCache(event.slug);

  return NextResponse.json({ success: true, data: event });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.slug) {
    const slugUsed = await prisma.event.findFirst({
      where: { slug: body.slug, NOT: { id: Number(id) } },
    });
    if (slugUsed) {
      return NextResponse.json(
        { message: "Slug already in use." },
        { status: 400 },
      );
    }
  }
  const proposalProvided =
    body.proposalUrl !== undefined || body.proposalPublicId !== undefined;

  const parsedProposal = proposalProvided ? parseProposal(body) : null;

  if (parsedProposal && !parsedProposal.ok) {
    return NextResponse.json(
      { message: parsedProposal.error },
      { status: 422 },
    );
  }

  // Slug lama dan update dibaca/ditulis dalam satu transaksi supaya slug
  // yang dipakai untuk invalidasi cache selalu slug yang benar-benar
  // digantikan oleh update ini (tidak tertinggal request lain).
  const { previous, event } = await prisma.$transaction(async (tx) => {
    const previous = await tx.event.findUnique({
      where: { id: Number(id) },
      select: { slug: true },
    });

    const event = await tx.event.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        slug: body.slug ?? slugify(body.title, { lower: true }),
        description: body.description,
        location: body.location,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        price: Number(body.price),
        quota: body.quota ? Number(body.quota) : null,
        categoryId: Number(body.categoryId),
        isPublished: Boolean(body.isPublished),
        coverImage: body.coverImage,
        publicId: body.publicId,
        ...(parsedProposal && parsedProposal.ok
          ? {
              proposalUrl: parsedProposal.url,
              proposalPublicId: parsedProposal.publicId,
            }
          : {}),
      },
    });

    return { previous, event };
  });

  revalidateEventCache(previous?.slug, event.slug);

  return NextResponse.json({ success: true, data: event });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const { id } = await params;
  const removed = await prisma.event.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
    select: { slug: true },
  });
  revalidateEventCache(removed.slug);

  return NextResponse.json({ success: true, message: "Event Deleted" });
}
