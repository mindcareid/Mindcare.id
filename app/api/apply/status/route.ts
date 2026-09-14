import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const [professional, membership] = await Promise.all([
      prisma.professional.findUnique({
        where: { userId },
        select: { slug: true, fullName: true, listingStatus: true },
      }),
      prisma.careCentreUser.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          status: true,
          centre: {
            select: { slug: true, name: true, listingStatus: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        professional,
        careCentre: membership?.centre ?? null,
        careCentreMembershipStatus: membership?.status ?? null,
      },
    });
  } catch (error) {
    console.error("APPLY STATUS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to load application status" },
      { status: 500 },
    );
  }
}
