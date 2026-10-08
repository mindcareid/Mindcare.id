import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser, parseDateOnly } from "@/lib/adminGuard";
import z from "zod";
import { Prisma } from "@prisma/client";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const PatchSchema = z
  .object({
    action: z.enum(["APPROVE", "REJECT"]),
    validUntil: z.string().regex(DATE_PATTERN).optional(),

    reason: z.string().trim().min(10).max(500).optional(),
  })
  .refine((data) => data.action !== "REJECT" || data.reason !== undefined, {
    message: "REJECT requires a reason of at least 10 characters",
  });

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const body: unknown = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }
    const { action, validUntil, reason } = parsed.data;

    const solution = await prisma.solution.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        listingStatus: true,
        ownerUserId: true,
      },
    });
    if (!solution) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 },
      );
    }
    if (solution.listingStatus !== "PENDING") {
      return NextResponse.json(
        {
          message: `Application already ${solution.listingStatus.toLowerCase()}`,
        },
        { status: 400 },
      );
    }

    const now = new Date();
    let finalValidUntil: Date | null = null;
    if (action === "APPROVE" && validUntil) {
      finalValidUntil = parseDateOnly(validUntil);
    }

    const updated = await prisma.solution.updateMany({
      where: { id, listingStatus: "PENDING" },
      data: {
        listingStatus: action === "APPROVE" ? "LISTED" : "REJECTED",
        verificationReview: action === "APPROVE" ? "APPROVED" : "REJECTED",
        verificationCheckedOn: now,
        verificationValidUntil: finalValidUntil,
        verificationAdminId: admin.id,
        verificationNote: action === "REJECT" ? reason! : null,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { message: "Application already reviewed" },
        { status: 400 },
      );
    }

    if (solution.ownerUserId) {
      try {
        await prisma.notification.create({
          data: {
            userId: solution.ownerUserId,
            type: "GENERAL",
            title:
              action === "APPROVE"
                ? "Solution application approved"
                : "Solution application rejected",
            message:
              action === "APPROVE"
                ? `Your solution "${solution.name}" has been approved and is now live in the directory.`
                : `Your solution "${solution.name}" was not approved. Reason: ${reason}`,
          },
        });
      } catch (err) {
        console.error("[NOTIFY SOLUTION REVIEW] failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message:
        action === "APPROVE" ? "Application approved" : "Application rejected",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 },
      );
    }
    console.error("PATCH ADMIN SOLUTION APPLICATION ERROR:", error);
    return NextResponse.json(
      { message: "Failed to review application" },
      { status: 500 },
    );
  }
}
