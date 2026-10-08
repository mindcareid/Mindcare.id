import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminGuard";

const STATUS_VALUES = ["PENDING", "LISTED", "REJECTED"] as const;
type StatusFilter = (typeof STATUS_VALUES)[number];

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  try {
    const statusParam = req.nextUrl.searchParams.get("status");
    const status: StatusFilter | undefined = STATUS_VALUES.includes(
      statusParam as StatusFilter,
    )
      ? (statusParam as StatusFilter)
      : undefined;

    const solutions = await prisma.solution.findMany({
      where: {
        deletedAt: null,
        ...(status ? { listingStatus: status } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        organizationName: true,
        tagline: true,
        description: true,
        website: true,
        contactEmail: true,
        contactPhone: true,
        logo: true,
        coverImage: true,
        listingStatus: true,
        verificationReview: true,
        verificationCheckedOn: true,
        verificationValidUntil: true,
        verificationNote: true,
        createdAt: true,
        category: { select: { slug: true, name: true } },
        audiences: {
          select: { audience: { select: { slug: true, name: true } } },
        },
        focusAreas: {
          select: { area: { select: { slug: true, name: true } } },
        },
        owner: {
          select: { id: true, name: true, email: true, phoneNumber: true },
        },
      },
    });

    return NextResponse.json({
      data: solutions.map((solution) => ({
        ...solution,
      })),
    });
  } catch (error) {
    console.error("GET ADMIN SOLUTION APPLICATIONS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}
