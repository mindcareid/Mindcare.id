import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminGuard";

const STATUS_VALUES = ["PENDING", "LISTED", "REJECTED"] as const;
type StatusFilter = (typeof STATUS_VALUES)[number];

/**
 * GET /api/cadmin/applications/care-centre?status=PENDING
 *
 * Termasuk klaim izin (permit*) dan data OWNER — konteks admin saja.
 */
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

    const centres = await prisma.careCentre.findMany({
      where: {
        deletedAt: null,
        ...(status ? { listingStatus: status } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        kind: true,
        description: true,
        street: true,
        city: true,
        province: true,
        postalCode: true,
        phone: true,
        website: true,
        acceptsBpjs: true,
        timeZone: true,
        openingNote: true,
        listingStatus: true,
        verificationReview: true,
        verificationCheckedOn: true,
        verificationValidUntil: true,
        verificationNote: true,
        permitType: true,
        permitNumber: true,
        permitValidUntil: true,
        createdAt: true,
        openingHours: { orderBy: { day: "asc" } },
        services: {
          select: { service: { select: { slug: true, name: true } } },
        },
        users: {
          where: { role: "OWNER" },
          select: {
            id: true,
            status: true,
            user: {
              select: { id: true, name: true, email: true, phoneNumber: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: centres.map((centre) => ({
        ...centre,
        services: centre.services.map((entry) => entry.service),
      })),
    });
  } catch (error) {
    console.error("GET ADMIN CARE CENTRE APPLICATIONS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}
