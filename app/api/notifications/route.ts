import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ Message: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: Number(session.user.id),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });
  return NextResponse.json({ data: notifications });
}
