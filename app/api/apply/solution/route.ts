import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApplySolutionSchema } from "@/lib/validations/apply";
import { generateUniqueSlug } from "@/lib/slug";
import z from "zod";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user.id);
    const existingSolution = await prisma.solution.findFirst({
      where: { ownerUserId: userId, deletedAt: null },
      select: { slug: true, listingStatus: true },
    });
    if (existingSolution) {
      return NextResponse.json(
        {
          message:
            existingSolution.listingStatus === "REJECTED"
              ? "Your previous solution application was rejected. Edit it and save to re-submit."
              : "You already have a solution on this account. Edit it from your dashboard instead.",
        },
        { status: 400 },
      );
    }

    const body: unknown = await req.json();
    const parsed = ApplySolutionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }
    const data = parsed.data;

    const category = await prisma.solutionCategory.findFirst({
      where: { slug: data.categorySlug, isActive: true },
      select: { id: true },
    });
    if (!category) {
      return NextResponse.json(
        { message: "That category is not recognised" },
        { status: 400 },
      );
    }

    const uniqueAudienceSlugs = [...new Set(data.audienceSlugs)];
    const audiences = await prisma.solutionAudience.findMany({
      where: { slug: { in: uniqueAudienceSlugs }, isActive: true },
      select: { id: true },
    });
    if (audiences.length !== uniqueAudienceSlugs.length) {
      return NextResponse.json(
        { message: "Some target users are not recognised" },
        { status: 400 },
      );
    }

    const uniqueFocusSlugs = [...new Set(data.focusSlugs)];
    const focusAreas = await prisma.areaOfSupport.findMany({
      where: { slug: { in: uniqueFocusSlugs }, isActive: true },
      select: { id: true },
    });
    if (focusAreas.length !== uniqueFocusSlugs.length) {
      return NextResponse.json(
        { message: "Some focus areas are not recognised" },
        { status: 400 },
      );
    }

    const solution = await prisma.solution.create({
      data: {
        ownerUserId: userId,
        organizationName: data.organizationName,
        name: data.name,
        slug: await generateUniqueSlug(
          data.name,
          "solution",
          async (candidate) => {
            const taken = await prisma.solution.findFirst({
              where: { slug: candidate },
              select: { id: true },
            });
            return taken !== null;
          },
        ),
        tagline: data.tagline,
        description: data.description,
        categoryId: category.id,
        logo: data.logo || null,
        logoPublicId: data.logoPublicId || null,
        coverImage: data.coverImage || null,
        coverPublicId: data.coverPublicId || null,
        website: data.website || null,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        listingStatus: "PENDING",
        verificationReview: "PENDING",
        verificationSource: "SUBMISSION",
        audiences: {
          create: audiences.map((audience) => ({ audienceId: audience.id })),
        },
        focusAreas: {
          create: focusAreas.map((area) => ({ areaId: area.id })),
        },
      },
      select: { slug: true },
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted",
      data: { slug: solution.slug },
    });
  } catch (error) {
    console.error("APPLY SOLUTION ERROR:", error);
    return NextResponse.json(
      { message: "Failed to submit application" },
      { status: 500 },
    );
  }
}
