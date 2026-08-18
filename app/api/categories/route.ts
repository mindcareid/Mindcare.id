import { NextRequest, NextResponse } from 'next/server'
import slugify from "slugify";

import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');
  if (id) {
    const detail = await prisma.categories.findUnique({
      where: {
        id: Number(id),
      },
    });
    if(detail){
      return NextResponse.json({ status:200, message: "success",data:detail })
    }
  }

  if(slug){
    const detail = await prisma.categories.findFirst({
      where: {
        slug: slug,
      },
    })
    if(detail){
      return NextResponse.json({ status:200, message: "success",data:detail })
    }
  }else{
    const data = await prisma.categories.findMany({
      include: {
        CategoriesSub: true,
      },
    })
    return NextResponse.json({ status:200, message: "success",data })
  }
}


export const POST = async (request: NextRequest) => {
 //const { title, content, image, user } = await request.json();
 const { title, content, photo, publicId } = await request.json();
 const slug = slugify(title, {
  lower: true, // convert to lower case, defaults to `false`
 });
 
 const categories = await prisma.categories.create({
  data: {
    title,
    slug,
    content,
    publicId: publicId || "",
    photo: photo || null,
  },
});

  return NextResponse.json({ status:200, message: "success",categories })
}

export const DELETE = async (request: NextRequest) => {
  const url = new URL(request.url).searchParams;
  const id = Number(url.get("id")) || 0;

  const categories = await prisma.categories.update({
    where: { id },
    data: { isactive: false },
  });

  return NextResponse.json({ status: 200, message: "deactivated", categories });
};

export const PUT = async (request: NextRequest) => {
  const url = new URL(request.url).searchParams
  const { title, content, photo, publicId } = await request.json();
  const slug = slugify(title, {
    lower: true, // convert to lower case, defaults to `false`
   });
  const categories = await prisma.categories.update({
    where:{
      id:Number(url.get('id')) || 0,
    },
    data: {
      slug,
      title,
      content,
      publicId: publicId || "",
      photo: photo || null,
    },
  })

  return NextResponse.json({ status:200, message: "success",categories })
}