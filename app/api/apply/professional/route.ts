import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApplyProfessionalSchema } from "@/lib/validations/apply";
import { generateUniqueSlug } from "@/lib/slug";
import z from "zod";

const PROFESSION_TO_ENUM = {
  Psikolog: "PSIKOLOG",
  Psikiater: "PSIKIATER",
  Konselor: "KONSELOR",
} as const;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const body: unknown = await req.json();
    const parsed = ApplyProfessionalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: z.treeifyError(parsed.error),
        },
        { status: 422 },
      );
    }
    const data = parsed.data;

    const existing = await prisma.professional.findUnique({
      where: { userId },
      select: { listingStatus: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          message:
            existing.listingStatus === "REJECTED"
              ? "Your previous application was rejected. Contact us before submitting again."
              : "You already have a professional application on this account.",
        },
        { status: 400 },
      );
    }

    const uniqueAreaSlugs = [...new Set(data.areaSlugs)];
    const areas = await prisma.areaOfSupport.findMany({
      where: { slug: { in: uniqueAreaSlugs }, isActive: true },
      select: { id: true, slug: true },
    });
    if (areas.length !== uniqueAreaSlugs.length) {
      return NextResponse.json(
        { message: "Some selected areas of support are not recognised" },
        { status: 400 },
      );
    }

    const startingPriceIdr = Math.min(
      ...data.services.map((service) => service.priceIdr),
    );

    const professional = await prisma.professional.create({
      data: {
        userId,
        slug: await generateUniqueSlug(
          data.fullName,
          "professional",
          async (candidate) => {
            const taken = await prisma.professional.findFirst({
              where: { slug: candidate },
              select: { id: true },
            });
            return taken !== null;
          },
        ),
        fullName: data.fullName,
        credentials: data.credentials,
        profession: PROFESSION_TO_ENUM[data.profession],
        headline: data.headline,
        bio: data.bio,
        baseCity: data.baseCity,
        baseProvince: data.baseProvince,
        languages: data.languages,
        yearsOfExperience: data.yearsOfExperience,
        startingPriceIdr,
        listingStatus: "PENDING",
        verificationReview: "PENDING",
        verificationSource: "SUBMISSION",
        licenceType: data.licenceType,
        licenceNumber: data.licenceNumber,
        licenceValidUntil: new Date(data.licenceValidUntil),
        services: {
          create: data.services.map((service) => ({
            name: service.name,
            mode: service.mode === "Online" ? "ONLINE" : "IN_PERSON",
            durationMinutes: service.durationMinutes,
            priceIdr: service.priceIdr,
          })),
        },
        areas: {
          create: areas.map((area) => ({ areaId: area.id })),
        },
      },
      select: { slug: true },
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted",
      data: { slug: professional.slug },
    });
  } catch (error) {
    console.error("APPLY PROFESSIONAL ERROR:", error);
    return NextResponse.json(
      { message: "Failed to submit application" },
      { status: 500 },
    );
  }
}
