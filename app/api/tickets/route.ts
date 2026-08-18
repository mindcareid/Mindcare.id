import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/tickets?eventId=123
 * Mengembalikan tiket user untuk event tertentu
 */
export async function GET(req: NextRequest) {
  try {
    // ✅ Ambil session user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Ambil query parameter
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ message: "Missing eventId" }, { status: 400 });
    }

    // ✅ Ambil tiket user untuk event tertentu
    const tickets = await prisma.ticket.findMany({
      where: {
        order: {
          userId: Number(session.user.id),
          eventId: Number(eventId),
          status: "PAID",
        },
      },
      select: {
        id: true,
        orderId: true,
        code: true,
        qrCode: true,
        attendeeData: true,
        isCheckedIn: true,
        checkedAt: true,
        order: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Return response
    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("[TICKETS_GET_ERROR]", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
