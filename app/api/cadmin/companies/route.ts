import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { role: true },
  });

  if (!user || !["SUPERADMIN", "ADMIN"].includes(user.role)) return null;
  return user;
}
/**
 * GET
 * - /api/companies
 * - /api/companies?id=1
 */
export async function GET(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const activeParam = searchParams.get("active");
    const statusFilter = searchParams.get("status");

    const isActive = activeParam === null ? undefined : activeParam === "true";

    /* ======================
       GET BY ID
    ====================== */
    if (id) {
      const company = await prisma.company.findFirst({
        where: {
          id: Number(id),
          deletedAt: null,
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          events: true,
        },
      });

      if (!company) {
        return NextResponse.json(
          { message: "Company not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ data: company });
    }

    /* ======================
       GET BY SLUG
    ====================== */
    if (slug) {
      const company = await prisma.company.findFirst({
        where: {
          slug,
          deletedAt: null,
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          events: true,
        },
      });

      if (!company) {
        return NextResponse.json(
          { message: "Company not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ data: company });
    }

    /* ======================
       GET ALL
    ====================== */
    const companies = await prisma.company.findMany({
      where: {
        ...(statusFilter === "DECLINED" ? {} : { deletedAt: null }),
        ...(isActive !== undefined && { isActive }),
        ...(statusFilter && {
          users: { some: { role: "OWNER", status: statusFilter as any } },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        isActive: true,
        location: true,
        createdAt: true,
        users: {
          where: { role: "OWNER" },
          select: {
            id: true,
            status: true,
            user: {
              select: { id: true, name: true, email: true, phonenumber: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: companies });
  } catch (error) {
    console.error("GET companies error:", error);
    return NextResponse.json(
      { message: "Failed to fetch companies" },
      { status: 500 },
    );
  }
}
/**
 * POST
 * - Create Company
 */
export async function POST(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { name, slug, logo, publicId, description, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 },
      );
    }

    // check slug unique
    const existing = await prisma.company.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Slug already exists" },
        { status: 400 },
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        logo,
        publicId,
        description,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(
      { message: "Company created", data: company },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST company error:", error);
    return NextResponse.json(
      { message: "Failed to create company" },
      { status: 500 },
    );
  }
}

/**
 * PUT
 * - Update Company
 * - /api/companies?id=1
 */
export async function PUT(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Company ID is required" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { name, slug, logo, publicId, description, isActive } = body;

    const company = await prisma.company.findFirst({
      where: {
        id: Number(id),
        deletedAt: null,
      },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 },
      );
    }

    // slug unique check (exclude self)
    if (slug) {
      const slugUsed = await prisma.company.findFirst({
        where: {
          slug,
          NOT: { id: Number(id) },
        },
      });

      if (slugUsed) {
        return NextResponse.json(
          { message: "Slug already in use" },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.company.update({
      where: { id: Number(id) },
      data: {
        name,
        slug,
        logo,
        publicId,
        description,
        isActive,
      },
    });

    return NextResponse.json({
      message: "Company updated",
      data: updated,
    });
  } catch (error) {
    console.error("PUT company error:", error);
    return NextResponse.json(
      { message: "Failed to update company" },
      { status: 500 },
    );
  }
}

/**
 * DELETE
 * - Soft delete
 * - /api/companies?id=1
 */
export async function DELETE(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Company ID is required" },
        { status: 400 },
      );
    }

    const company = await prisma.company.findFirst({
      where: {
        id: Number(id),
        deletedAt: null,
      },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 },
      );
    }

    const companyId = company.id;
    await prisma.$transaction([
      prisma.company.update({
        where: { id: company.id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      }),
      prisma.companyUser.updateMany({
        where: { companyId, status: "ACTIVE" },
        data: { status: "DECLINED" },
      }),
      prisma.event.updateMany({
        where: { companyId, isPublished: true, deletedAt: null },
        data: { isPublished: false },
      }),
    ]);

    return NextResponse.json({
      message: "Company deleted",
    });
  } catch (error) {
    console.error("DELETE company error:", error);
    return NextResponse.json(
      { message: "Failed to delete company" },
      { status: 500 },
    );
  }
}
