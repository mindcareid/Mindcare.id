import { getAdminUser } from "@/lib/adminGuard";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
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
