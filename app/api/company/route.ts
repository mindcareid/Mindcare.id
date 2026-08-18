import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateCompanySchema } from "@/lib/validations/auth";
import z from "zod";
import { sendCompanySubmittedEmail } from "@/lib/email";

async function getCurrentUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  return Number(session.user.id);
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();

    const parsed = CreateCompanySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: z.treeifyError(parsed.error),
        },
        { status: 422 },
      );
    }

    const existingCompany = await prisma.companyUser.findFirst({
      where: {
        userId,
        status: { in: ["ACTIVE", "PENDING"] },
      },
    });

    if (existingCompany) {
      return NextResponse.json(
        { message: "You already have a company" },
        { status: 400 },
      );
    }

    const {
      name,
      description,
      logo,
      publicId,
      location,
      website,
      phone,
      email,
      instagram,
      linkedln,
    } = parsed.data;

    const slug = slugify(name, { lower: true, strict: true, trim: true });

    const slugUsed = await prisma.company.findFirst({
      where: {
        slug,
        deletedAt: null,
        users: {
          some: {
            status: {
              in: ["ACTIVE", "PENDING"],
            },
          },
        },
      },
    });

    if (slugUsed) {
      return NextResponse.json(
        { message: "Company name already in use" },
        { status: 400 },
      );
    }

    /* ===== CREATE COMPANY + OWNER ===== */
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        description,
        logo,
        publicId,
        location: location || null,
        website: website || null,
        phone: phone || null,
        email: email || null,
        instagram: instagram || null,
        linkedln: linkedln || null,
        isActive: false,
        users: {
          create: {
            userId,
            role: "OWNER",
            status: "PENDING",
          },
        },
      },
    });

    const ownerUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (ownerUser) {
      try {
        await sendCompanySubmittedEmail({
          to: ownerUser.email,
          ownerName: ownerUser.name,
          companyName: name,
        });
      } catch (err) {
        console.error("[sendCompanySubmittedEmail] failed:", err);
      }
    }
    return NextResponse.json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    console.error("CREATE COMPANY ERROR:", error);
    return NextResponse.json(
      { message: "Failed to create company" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const companyUser = await prisma.companyUser.findFirst({
    where: {
      userId: Number(session.user.id),
      status: "ACTIVE",
      company: {
        deletedAt: null,
        isActive: true,
      },
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          isActive: true,
          location: true,
          website: true,
          phone: true,
          email: true,
          instagram: true,
          linkedln: true,
        },
      },
    },
  });

  if (!companyUser) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  const companyId = companyUser.companyId;
  const now = new Date();

  const [totalEvents, upcomingEvents, ongoingEvents, pastEvents] =
    await Promise.all([
      prisma.event.count({
        where: { companyId, deletedAt: null, isPublished: true },
      }),
      prisma.event.count({
        where: {
          companyId,
          deletedAt: null,
          isPublished: true,
          startDate: { gt: now },
        },
      }),
      prisma.event.count({
        where: {
          companyId,
          deletedAt: null,
          isPublished: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
      prisma.event.count({
        where: {
          companyId,
          deletedAt: null,
          isPublished: true,
          endDate: { lt: now },
        },
      }),
    ]);

  return NextResponse.json({
    success: true,
    data: companyUser.company,
    role: companyUser.role,
    stats: { totalEvents, upcomingEvents, ongoingEvents, pastEvents },
  });
}
