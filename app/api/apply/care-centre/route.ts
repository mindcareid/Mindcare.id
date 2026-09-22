import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApplyCareCentreSchema } from "@/lib/validations/apply";
import { generateUniqueSlug } from "@/lib/slug";
import z from "zod";
import { Prisma } from "@prisma/client";

const KIND_TO_ENUM = {
  Klinik: "KLINIK",
  "Rumah Sakit": "RUMAH_SAKIT",
  Puskesmas: "PUSKESMAS",
  "Pusat Konseling": "PUSAT_KONSELING",
} as const;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const body: unknown = await req.json();
    const parsed = ApplyCareCentreSchema.safeParse(body);
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

    if (data.kind === "Puskesmas") {
      return NextResponse.json(
        {
          message:
            "Puskesmas listings are curated by our team from public registries and cannot be registered here. Contact us if you represent one.",
        },
        { status: 400 },
      );
    }

    const existingMembership = await prisma.careCentreUser.findFirst({
      where: { userId, status: { in: ["PENDING", "ACTIVE"] } },
      select: { id: true },
    });
    if (existingMembership) {
      return NextResponse.json(
        {
          message:
            "You already have a care centre application on this account.",
        },
        { status: 400 },
      );
    }

    const uniqueServiceSlugs = [...new Set(data.serviceSlugs)];
    const services = await prisma.service.findMany({
      where: { slug: { in: uniqueServiceSlugs }, isActive: true },
      select: { id: true, slug: true },
    });
    if (services.length !== uniqueServiceSlugs.length) {
      return NextResponse.json(
        { message: "Some selected services are not recognised" },
        { status: 400 },
      );
    }

    const centre = await prisma.careCentre.create({
      data: {
        slug: await generateUniqueSlug(
          data.name,
          "care-centre",
          async (candidate) => {
            const taken = await prisma.careCentre.findFirst({
              where: { slug: candidate },
              select: { id: true },
            });
            return taken !== null;
          },
        ),
        name: data.name,
        kind: KIND_TO_ENUM[data.kind],
        description: data.description || null,
        street: data.street,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        phone: data.phone,
        website: data.website || null,
        acceptsBpjs: data.acceptsBpjs,
        timeZone: data.timeZone,
        openingNote: data.openingNote || null,
        listingStatus: "PENDING",
        verificationReview: "PENDING",
        verificationSource: "SUBMISSION",
        permitType: data.permitType,
        permitNumber: data.permitNumber,
        permitValidUntil: new Date(data.permitValidUntil),
        openingHours: {
          create: data.openingHours.map((hour) => ({
            day: hour.day,
            opens: hour.opens,
            closes: hour.closes,
          })),
        },
        services: {
          create: services.map((service) => ({ serviceId: service.id })),
        },
        users: {
          create: {
            userId,
            role: "OWNER",
            status: "PENDING",
            
            activeUserId: userId,
          },
        },
      },
      select: { slug: true },
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted",
      data: { slug: centre.slug },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target as string[] | string | undefined;
      const fields = Array.isArray(target) ? target.join(", ") : target;
      if (fields?.includes("activeUserId")) {
        return NextResponse.json(
          {
            message:
              "You already have a care centre application on this account.",
          },
          { status: 400 },
        );
      }
    }
    console.error("APPLY CARE CENTRE ERROR:", error);
    return NextResponse.json(
      { message: "Failed to submit application" },
      { status: 500 },
    );
  }
}
