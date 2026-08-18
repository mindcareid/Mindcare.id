import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  // Validasi query
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  if (query.length > 100) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        title: {
          contains: query,
        },
      },
      take: 8,
      select: {
        id: true,
        title: true,
        coverImage: true,
        slug: true,
        location: true,
        startDate: true,
        endDate: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("[SEARCH_API_ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
