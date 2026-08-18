import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import slugify from "slugify";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { role: true },
  });

  if (!user || !["SUPERADMIN", "ADMIN"].includes(user.role)) return null;
  return user;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { id: Number(id), deletedAt: null },
    include: { category: true, company: true },
  });

  if (!event) {
    return NextResponse.json({ message: "Event not found!" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: event });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await checkAdmin();
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

  const event = await prisma.event.update({
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
      companyId: Number(body.companyId),
      isPublished: Boolean(body.isPublished),
      coverImage: body.coverImage,
      publicId: body.publicId,
    },
  });
  return NextResponse.json({ success: true, data: event });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.event.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true, message: "Event Deleted" });
}
