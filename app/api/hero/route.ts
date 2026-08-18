import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";

/**
 * GET  → Semua hero sliders
 * POST → Create hero slider
 * PUT  → Update hero slider (wajib kirim id)
 * DELETE → Delete hero slider (wajib kirim id)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const detail = await prisma.heroSlider.findUnique({
      where: { id: Number(id) },
    });
    if (detail) {
      return NextResponse.json({ status: 200, message: 'success', data: detail });
    } else {
      return NextResponse.json({ status: 404, message: 'Hero not found' });
    }
  }

  const data = await prisma.heroSlider.findMany({
    orderBy: { order: 'asc' },
  });

  return NextResponse.json({ status: 200, message: 'success', data });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const hero = await prisma.heroSlider.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        image: data.image,
        publicId: data.publicId ?? null,
        button_text: data.button_text,
        button_url: data.button_url,
        align_text: data.align_text,
        order: data.order ?? 0,
        is_active: data.is_active ?? true,
      },
    });

    return NextResponse.json(hero);
  } catch (error) {
    console.error("POST Hero Error:", error);
    return NextResponse.json({ error: "Failed to create hero" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    if (!data.id) {
      return NextResponse.json({ error: "ID is required for update" }, { status: 400 });
    }

    const hero = await prisma.heroSlider.update({
      where: { id: data.id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        image: data.image,
        publicId: data.publicId ?? null,
        button_text: data.button_text,
        button_url: data.button_url,
        align_text: data.align_text,
        order: data.order ?? 0,
        is_active: data.is_active ?? true,
      },
    });

    return NextResponse.json(hero);
  } catch (error) {
    console.error("PUT Hero Error:", error);
    return NextResponse.json({ error: "Failed to update hero" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required for delete" }, { status: 400 });
    }

    await prisma.heroSlider.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Hero deleted" });
  } catch (error) {
    console.error("DELETE Hero Error:", error);
    return NextResponse.json({ error: "Failed to delete hero" }, { status: 500 });
  }
}
