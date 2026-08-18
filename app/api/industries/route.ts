import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const industries = await prisma.industry.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: industries });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
