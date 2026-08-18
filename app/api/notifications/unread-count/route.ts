import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.notification.count({
    where: {
      userId: Number(session.user.id),
      isRead: false,
    },
  });
  return NextResponse.json({ count });

  
}
