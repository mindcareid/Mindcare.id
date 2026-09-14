import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');
  const categoriesId = searchParams.get('categoriesId');

  if (slug) {
    const detail = await prisma.categoriesSub.findFirst({ where: { slug } });
    return NextResponse.json({ status: 200, message: "success", data: detail });
  } else if (id) {
    const detail = await prisma.categoriesSub.findFirst({ where: { id: Number(id) } });
    return NextResponse.json({ status: 200, message: "success", data: detail });
  } else if (categoriesId) {
    const list = await prisma.categoriesSub.findMany({ where: { categoriesId: Number(categoriesId) },include: { categories: true } });
    return NextResponse.json({ status: 200, message: "success", data: list });
  } else {
    const all = await prisma.categoriesSub.findMany();
    return NextResponse.json({ status: 200, message: "success", data: all });
  }
}

export const POST = async (request: NextRequest) => {
  const { title, slug, content, categoriesId, isActive } = await request.json();

  const generatedSlug = slug ? slug : slugify(title, { lower: true });

  const data = await prisma.categoriesSub.create({
    data: {
      title,
      slug: generatedSlug,
      content,
      categoriesId: Number(categoriesId),
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({ status: 200, message: "created", data });
};

export const PUT = async (request: NextRequest) => {
  const url = new URL(request.url);
  const id = Number(url.searchParams.get('id') || 0);
  const { title, slug, content, categoriesId, isActive } = await request.json();

  const generatedSlug = slug ? slug : slugify(title, { lower: true });

  const updated = await prisma.categoriesSub.update({
    where: { id },
    data: {
      title,
      slug: generatedSlug,
      content,
      categoriesId: Number(categoriesId),
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({ status: 200, message: "updated", data: updated });
};

export const DELETE = async (request: NextRequest) => {
  const url = new URL(request.url);
  const id = Number(url.searchParams.get('id') || 0);

  // Soft delete by setting isActive to false
  const deleted = await prisma.categoriesSub.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ status: 200, message: "soft-deleted", data: deleted });
};
