import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EditSolutionSchema } from "@/lib/validations/apply";
import z from "zod";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const current = await prisma.solution.findFirst({
      where: { id, ownerUserId: userId, deletedAt: null },
      include: {
        category: { select: { slug: true } },
        audiences: { select: { audienceId: true } },
        focusAreas: { select: { areaId: true } },
      },
    });
    if (!current) {
      return NextResponse.json(
        { message: "Solution not found" },
        { status: 404 },
      );
    }

    const body: unknown = await req.json();
    const parsed = EditSolutionSchema.safeParse(body);
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

    const identityChanged =
      current.organizationName !== data.organizationName ||
      current.name !== data.name ||
      current.category.slug !== data.categorySlug;

    const requiresReview =
      identityChanged || current.listingStatus === "REJECTED";

    await prisma.$transaction(async (tx) => {
      await tx.solution.update({
        where: { id: current.id },
        data: {
          tagline: data.tagline,
          description: data.description,
          ...(data.logo !== undefined
            ? {
                logo: data.logo || null,
                logoPublicId: data.logoPublicId || null,
              }
            : {}),
          ...(data.coverImage !== undefined
            ? {
                coverImage: data.coverImage || null,
                coverPublicId: data.coverPublicId || null,
              }
            : {}),
          website: data.website || null,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone || null,
          audiences: {
            deleteMany: {},
            create: audiences.map((audience) => ({ audienceId: audience.id })),
          },
          focusAreas: {
            deleteMany: {},
            create: focusAreas.map((area) => ({ areaId: area.id })),
          },
          // Identitas.
          organizationName: data.organizationName,
          name: data.name,
          categoryId: category.id,
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
      });
    });

    return NextResponse.json({
      success: true,
      message: requiresReview
        ? "Saved. Your listing is back under review and hidden from the directory until it is approved again."
        : "Saved.",
      data: { requiresReview },
    });
  } catch (error) {
    console.error("PATCH DASHBOARD SOLUTION ERROR:", error);
    return NextResponse.json(
      { message: "Failed to save changes" },
      { status: 500 },
    );
  }
}
