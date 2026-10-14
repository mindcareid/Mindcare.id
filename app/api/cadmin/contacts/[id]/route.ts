import { getAdminUser } from "@/lib/adminGuard";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

//GET All contact us
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const contact = await prisma.contactMessage.findUnique({
    where: {
      id: Number(params.id),
    },
  });
  if (!contact) {
    return NextResponse.json({ message: "Not Found!" }, { status: 404 });
  }

  if (contact.status === "UNREAD") {
    await prisma.contactMessage.update({
      where: { id: Number(params.id) },
      data: { status: "READ" },
    });
  }

  return NextResponse.json({
    data: { ...contact, status: contact.status === "UNREAD" },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const contact = await prisma.contactMessage.update({
    where: {
      id: Number(params.id),
    },
    data: {
      status: "REPLIED",
      repliedAt: new Date(),
    },
  });

  return NextResponse.json({ data: contact });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  await prisma.contactMessage.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ message: "Deleted" });
}
