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

    const professionals = await prisma.professional.findMany({
      where: {
        deletedAt: null,
        ...(status ? { listingStatus: status } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        fullName: true,
        credentials: true,
        profession: true,
        headline: true,
        bio: true,
        baseCity: true,
        baseProvince: true,
        languages: true,
        yearsOfExperience: true,
        startingPriceIdr: true,
        listingStatus: true,
        verificationReview: true,
        verificationCheckedOn: true,
        verificationValidUntil: true,
        verificationNote: true,
        licenceType: true,
        licenceNumber: true,
        licenceValidUntil: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, phoneNumber: true },
        },
        services: true,
        areas: {
          select: { area: { select: { slug: true, name: true } } },
        },
      },
    });

    return NextResponse.json({
      data: professionals.map((professional) => ({
        ...professional,
        areas: professional.areas.map((entry) => entry.area),
      })),
    });
  } catch (error) {
    console.error("GET ADMIN PROFESSIONAL APPLICATIONS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}
