import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EditCareCentreSchema } from "@/lib/validations/apply";
import z from "zod";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const KIND_TO_ENUM = {
  Klinik: "KLINIK",
  "Rumah Sakit": "RUMAH_SAKIT",
  Puskesmas: "PUSKESMAS",
  "Pusat Konseling": "PUSAT_KONSELING",
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

    const membership = await prisma.careCentreUser.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { centre: true },
    });
    if (!membership) {
      return NextResponse.json(
        { message: "You do not have a care centre listing" },
        { status: 404 },
      );
    }
    const current = membership.centre;

    const body: unknown = await req.json();
    const parsed = EditCareCentreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }
    const data = parsed.data;
    if (data.kind === "Puskesmas") {
      return NextResponse.json(
        {
          message:
            "Puskesmas listings are curated by our team and cannot be registered here.",
        },
        { status: 400 },
      );
    }

    const uniqueServiceSlugs = [...new Set(data.serviceSlugs)];
    const services = await prisma.service.findMany({
      where: { slug: { in: uniqueServiceSlugs }, isActive: true },
      select: { id: true },
    });
    if (services.length !== uniqueServiceSlugs.length) {
      return NextResponse.json(
        { message: "Some selected services are not recognised" },
        { status: 400 },
      );
    }

    const kindEnum = KIND_TO_ENUM[data.kind];
    const identityChanged =
      current.name !== data.name ||
      current.kind !== kindEnum ||
      current.street !== data.street ||
      current.city !== data.city ||
      current.province !== data.province ||
      current.postalCode !== data.postalCode ||
      (current.permitType ?? "") !== data.permitType ||
      (current.permitNumber ?? "") !== data.permitNumber ||
      dateOnly(current.permitValidUntil) !== data.permitValidUntil;

    const requiresReview =
      identityChanged || current.listingStatus === "REJECTED";

    await prisma.$transaction(async (tx) => {
      await tx.careCentre.update({
        where: { id: current.id },
        data: {
          // Presentasi.
          description: data.description || null,
          phone: data.phone,
          website: data.website || null,
          acceptsBpjs: data.acceptsBpjs,
          timeZone: data.timeZone,
          openingNote: data.openingNote || null,
          openingHours: {
            deleteMany: {},
            create: data.openingHours.map((hour) => ({
              day: hour.day,
              opens: hour.opens,
              closes: hour.closes,
            })),
          },
          services: {
            deleteMany: {},
            create: services.map((service) => ({ serviceId: service.id })),
          },
          // Identitas.
          name: data.name,
          kind: kindEnum,
          street: data.street,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          permitType: data.permitType,
          permitNumber: data.permitNumber,
          permitValidUntil: new Date(data.permitValidUntil),
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

      if (requiresReview) {
        await tx.careCentreUser.update({
          where: { id: membership.id },
          data: { status: "PENDING", activeUserId: userId },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: requiresReview
        ? "Saved. Your centre is back under review and hidden from the directory until it is approved again."
        : "Successfully Saved data care-centre.",
      data: { requiresReview },
    });
  } catch (error) {
    // Dua pengajuan aktif dari akun yang sama (balapan) tetap ditolak di sini.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "You already have an active care centre application." },
        { status: 400 },
      );
    }
    console.error("PATCH DASHBOARD CARE CENTRE ERROR:", error);
    return NextResponse.json(
      { message: "Failed to save changes" },
      { status: 500 },
    );
  }
}
