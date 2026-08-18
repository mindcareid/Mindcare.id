import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET
 * - /api/about-sections
 * - /api/about-sections?id=1
 * - /api/about-sections?active=true
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const activeParam = searchParams.get("active");

    const isActive =
      activeParam === null ? undefined : activeParam === "true";

    /* ======================
       GET BY ID
    ====================== */
    if (id) {
      const section = await prisma.aboutSection.findUnique({
        where: { id: Number(id) },
      });

      if (!section) {
        return NextResponse.json(
          {
            status: 404,
            message: "About section not found",
            data: null,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: 200,
        message: "About section fetched",
        data: section,
      });
    }

    /* ======================
       GET ALL
    ====================== */
    const sections = await prisma.aboutSection.findMany({
      where: {
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: {
        orderIndex: "asc",
      },
    });

    return NextResponse.json({
      status: 200,
      message: "About sections fetched",
      data: sections,
    });
  } catch (error) {
    console.error("GET about sections error:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to fetch about sections",
        data: [],
      },
      { status: 500 }
    );
  }
}
/**
 * POST
 * - Create About Section
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      imageUrl,
      publicId,
      orderIndex,
      imagePosition,
      isActive,
    } = body;

    if (!title || !description || !imageUrl) {
      return NextResponse.json(
        { message: "Title, description and image are required" },
        { status: 400 }
      );
    }

    const section = await prisma.aboutSection.create({
      data: {
        title,
        description,
        imageUrl,
        publicId,
        orderIndex: orderIndex ?? 0,
        imagePosition: imagePosition ?? "left",
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(
      { message: "About section created", data: section },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST about section error:", error);
    return NextResponse.json(
      { message: "Failed to create about section" },
      { status: 500 }
    );
  }
}

/**
 * PUT
 * - Update About Section
 * - /api/about-sections?id=1
 */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "About section ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      imageUrl,
      publicId,
      orderIndex,
      imagePosition,
      isActive,
    } = body;

    const section = await prisma.aboutSection.findUnique({
      where: { id: Number(id) },
    });

    if (!section) {
      return NextResponse.json(
        { message: "About section not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.aboutSection.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        imageUrl,
        publicId,
        orderIndex,
        imagePosition,
        isActive,
      },
    });

    return NextResponse.json({
      message: "About section updated",
      data: updated,
    });
  } catch (error) {
    console.error("PUT about section error:", error);
    return NextResponse.json(
      { message: "Failed to update about section" },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 * - Soft delete (nonaktifkan)
 * - /api/about-sections?id=1
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "About section ID is required" },
        { status: 400 }
      );
    }

    const section = await prisma.aboutSection.findUnique({
      where: { id: Number(id) },
    });

    if (!section) {
      return NextResponse.json(
        { message: "About section not found" },
        { status: 404 }
      );
    }

    await prisma.aboutSection.update({
      where: { id: Number(id) },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      message: "About section deleted",
    });
  } catch (error) {
    console.error("DELETE about section error:", error);
    return NextResponse.json(
      { message: "Failed to delete about section" },
      { status: 500 }
    );
  }
}