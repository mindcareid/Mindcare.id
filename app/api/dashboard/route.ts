import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [totalUsers, totalEvents,] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
    ]);

    return NextResponse.json({
      users: totalUsers,
      events: totalEvents,

    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
