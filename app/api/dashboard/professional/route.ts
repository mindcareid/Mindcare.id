import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EditProfessionalSchema } from "@/lib/validations/apply";
import z from "zod";

export const dynamic = "force-dynamic";

const PROFESSION_TO_ENUM = {
  Psikolog: "PSIKOLOG",
  Psikiater: "PSIKIATER",
  Konselor: "KONSELOR",
} as const;

const MODE_TO_ENUM = {
  Online: "ONLINE",
  "In Person": "IN_PERSON",
} as const;

function dateOnly(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const current = await prisma.professional.findUnique({ where: { userId } });
    if (!current) {
      return NextResponse.json(
        { message: "You do not have a professional listing" },
        { status: 404 },
      );
    }

    const body: unknown = await req.json();
    const parsed = EditProfessionalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }
    const data = parsed.data;

    const uniqueAreaSlugs = [...new Set(data.areaSlugs)];
    const areas = await prisma.areaOfSupport.findMany({
      where: { slug: { in: uniqueAreaSlugs }, isActive: true },
      select: { id: true },
    });
    if (areas.length !== uniqueAreaSlugs.length) {
      return NextResponse.json(
        { message: "Some selected areas of support are not recognised" },
        { status: 400 },
      );
    }

    const professionEnum = PROFESSION_TO_ENUM[data.profession];
    const identityChanged =
      current.fullName !== data.fullName ||
      current.credentials !== data.credentials ||
      current.profession !== professionEnum ||
      (current.licenceType ?? "") !== data.licenceType ||
      (current.licenceNumber ?? "") !== data.licenceNumber ||
      dateOnly(current.licenceValidUntil) !== data.licenceValidUntil;

    const requiresReview =
      identityChanged || current.listingStatus === "REJECTED";

    const startingPriceIdr = Math.min(
      ...data.services.map((service) => service.priceIdr),
    );

    await prisma.professional.update({
      where: { id: current.id },
      data: {
        // Presentasi — selalu boleh berubah.
        headline: data.headline,
        bio: data.bio,
        baseCity: data.baseCity,
        baseProvince: data.baseProvince,
        languages: data.languages,
        yearsOfExperience: data.yearsOfExperience,
        startingPriceIdr,
        fullName: data.fullName,
        credentials: data.credentials,
        profession: professionEnum,
        licenceType: data.licenceType,
        licenceNumber: data.licenceNumber,
        licenceValidUntil: new Date(data.licenceValidUntil),
        services: {
          deleteMany: {},
          create: data.services.map((service) => ({
            name: service.name,
            mode: MODE_TO_ENUM[service.mode],
            durationMinutes: service.durationMinutes,
            priceIdr: service.priceIdr,
          })),
        },
        areas: {
          deleteMany: {},
          create: areas.map((area) => ({ areaId: area.id })),
        },
        ...(requiresReview
          ? {
              listingStatus: "PENDING",
              verificationReview: "PENDING",
              verificationCheckedOn: null,
              verificationValidUntil: null,
              verificationSource: "SUBMISSION",
              verificationAdminId: null,
              verificationNote: null,
            }
          : {}),
      },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      message: requiresReview
        ? "Saved. Your listing is back under review and hidden from the directory until it is approved again."
        : "Successfully Saved data Professionals.",
      data: { requiresReview },
    });
  } catch (error) {
    console.error("PATCH DASHBOARD PROFESSIONAL ERROR:", error);
    return NextResponse.json(
      { message: "Failed to save changes" },
      { status: 500 },
    );
  }
}
