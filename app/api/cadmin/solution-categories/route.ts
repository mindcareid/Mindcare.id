import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import slugify from "slugify";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminGuard";

const THEMES = ["navy", "purple", "emerald"] as const;
type Theme = (typeof THEMES)[number];

function parseTheme(value: unknown): Theme | undefined {
  return THEMES.includes(value as Theme) ? (value as Theme) : undefined;
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const data = await prisma.solutionCategory.findMany({
    orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }
  const slug =
    String(body?.slug ?? "").trim() || slugify(name, { lower: true, strict: true });

  const existing = await prisma.solutionCategory.findUnique({
    where: { slug },
  });
  if (existing) {
    return NextResponse.json(
      { message: "Slug already in use" },
      { status: 400 },
    );
  }

  const created = await prisma.solutionCategory.create({
    data: {
      name,
      slug,
      theme: parseTheme(body?.theme) ?? "navy",
      orderIndex: Number(body?.orderIndex) || 0,
      isActive: body?.isActive ?? true,
    },
  });
  return NextResponse.json(
    { message: "Created", data: created },
    { status: 201 },
  );
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const data: Prisma.SolutionCategoryUpdateInput = {};

  if (body?.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    data.name = name;
  }
  if (body?.slug !== undefined) {
    const slug = String(body.slug).trim();
    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }
    const used = await prisma.solutionCategory.findFirst({
      where: { slug, NOT: { id } },
    });
    if (used) {
      return NextResponse.json(
        { message: "Slug already in use" },
        { status: 400 },
      );
    }
    data.slug = slug;
  }
  const theme = parseTheme(body?.theme);
  if (theme) data.theme = theme;
  if (body?.orderIndex !== undefined) {
    data.orderIndex = Number(body.orderIndex) || 0;
  }
  if (body?.isActive !== undefined) {
    data.isActive = Boolean(body.isActive);
  }

  const updated = await prisma.solutionCategory.update({ where: { id }, data });
  return NextResponse.json({ message: "Updated", data: updated });
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const inUse = await prisma.solution.count({ where: { categoryId: id } });
  if (inUse > 0) {
    return NextResponse.json(
      {
        message:
          "Cannot delete: solutions still use this category. Deactivate it instead.",
      },
      { status: 400 },
    );
  }

  await prisma.solutionCategory.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
