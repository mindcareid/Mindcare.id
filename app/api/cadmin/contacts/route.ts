import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { role: true },
  });

  if (!user || !["SUPERADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const contacts = await prisma.contactMessage.findMany({
    where: { ...(status ? { status: status as any } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: contacts });
}
