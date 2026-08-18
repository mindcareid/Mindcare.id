import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: {
      userId: Number(session.user.id),
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return NextResponse.json({ success: true });
}
