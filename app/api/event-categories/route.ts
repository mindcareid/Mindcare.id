import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET
 * - /api/event-categories
 * - /api/event-categories?id=1
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // GET by ID
    if (id) {
      const category = await prisma.eventCategory.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          events: true,
        },
      });

      if (!category) {
        return NextResponse.json(
          { message: "Event category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: category });
    }

    // GET all
    const categories = await prisma.eventCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("GET event categories error:", error);
    return NextResponse.json(
      { message: "Failed to fetch event categories" },
      { status: 500 }
    );
  }
}

/**
 * POST
 * - Create Event Category
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 }
      );
    }

    // check slug unique
    const existing = await prisma.eventCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.eventCategory.create({
      data: {
        name,
        slug,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(
      { message: "Event category created", data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST event category error:", error);
    return NextResponse.json(
      { message: "Failed to create event category" },
      { status: 500 }
    );
  }
}

/**
 * PUT
 * - Update Event Category
 * - /api/event-categories?id=1
 */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Event category ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, slug, isActive } = body;

    const category = await prisma.eventCategory.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Event category not found" },
        { status: 404 }
        );
    }

    // slug unique check (exclude self)
    if (slug) {
      const slugUsed = await prisma.eventCategory.findFirst({
        where: {
          slug,
          NOT: { id: Number(id) },
        },
      });

      if (slugUsed) {
        return NextResponse.json(
          { message: "Slug already in use" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.eventCategory.update({
      where: { id: Number(id) },
      data: {
        name,
        slug,
        isActive,
      },
    });

    return NextResponse.json({
      message: "Event category updated",
      data: updated,
    });
  } catch (error) {
    console.error("PUT event category error:", error);
    return NextResponse.json(
      { message: "Failed to update event category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 * - Hard delete (category biasanya master data)
 * - /api/event-categories?id=1
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Event category ID is required" },
        { status: 400 }
      );
    }

    const category = await prisma.eventCategory.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Event category not found" },
        { status: 404 }
      );
    }

    await prisma.eventCategory.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      message: "Event category deleted",
    });
  } catch (error) {
    console.error("DELETE event category error:", error);
    return NextResponse.json(
      { message: "Failed to delete event category" },
      { status: 500 }
    );
  }
}
