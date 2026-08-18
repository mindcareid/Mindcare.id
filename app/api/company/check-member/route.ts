import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ active: false, status: null });
  }

  const member = await prisma.companyUser.findFirst({
    where: { userId: Number(session.user.id) },
    select: { status: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    active: member?.status === "ACTIVE",
    status: member?.status ?? null,
  });
}
