import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { WhyUsType } from "@prisma/client";

/* =====================================================
   GET WHY US (all | by id | by type)
===================================================== */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const idParam = searchParams.get("id");
    const typeParam = searchParams.get("type");

    /* =========================
       GET BY ID
    ========================= */
    if (idParam) {
      const id = Number(idParam);

      if (Number.isNaN(id)) {
        return NextResponse.json(
          { message: "Invalid ID" },
          { status: 400 }
        );
      }

      const detail = await prisma.whyUs.findUnique({
        where: { id },
      });

      if (!detail) {
        return NextResponse.json(
          { message: "Data not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "success",
        data: detail,
      });
    }

    /* =========================
       GET ALL / FILTER BY TYPE
    ========================= */
    const whereClause: {
      type?: WhyUsType;
    } = {};

    if (typeParam) {
      // validasi enum (WAJIB)
      if (!Object.values(WhyUsType).includes(typeParam as WhyUsType)) {
        return NextResponse.json(
          { message: "Invalid type value" },
          { status: 400 }
        );
      }

      whereClause.type = typeParam as WhyUsType;
    }

    const data = await prisma.whyUs.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      message: "success",
      data,
    });
  } catch (error) {
    console.error("GET whyUs error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// CREATE
export const POST = async (request: NextRequest) => {
  const { title, description, image, publicId, hoverImg, hoverPublicId, isActive, type } = await request.json();

  const whyUs = await prisma.whyUs.create({
    data: {
      title,
      description: description || null,
      image: image || null,
      publicId: publicId || null,
      hoverImg: hoverImg || null,
      hoverPublicId: hoverPublicId || null,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      type: type || 'WHY_US',
    },
  });

  return NextResponse.json({ status: 200, message: 'success', data: whyUs });
};

// UPDATE
export const PUT = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id')) || 0;
  const { title, description, image, publicId, hoverImg, hoverPublicId, isActive, type } = await request.json();

  const whyUs = await prisma.whyUs.update({
    where: { id },
    data: {
      title,
      description: description || null,
      image: image || null,
      publicId: publicId || null,
      hoverImg: hoverImg || null,
      hoverPublicId: hoverPublicId || null,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      type: type || 'WHY_US',
    },
  });

  return NextResponse.json({ status: 200, message: 'success', data: whyUs });
};

// DELETE
export const DELETE = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id')) || 0;

  const whyUs = await prisma.whyUs.delete({
    where: { id },
  });

  return NextResponse.json({ status: 200, message: 'deleted', data: whyUs });
};
