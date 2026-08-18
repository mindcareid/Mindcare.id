import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
import { z } from "zod";
import { parse } from "path";

const IndustrySchema = z.object({
  name: z.string().min(2).max(255),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const industries = await prisma.industry.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: industries });
  } catch (err) {
    console.error("[GET_INDUSTRIES]", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON BODY!" },
      { status: 400 },
    );
  }

  const parsed = IndustrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation Failed!",
        errors: z.treeifyError(parsed.error),
      },
      { status: 422 },
    );
  }

  const { name, isActive } = parsed.data;
  const slug = slugify(name, { lower: true, strict: true });

  try {
    const existing = await prisma.industry.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { message: "Already name Industries!, please check again" },
        { status: 409 },
      );
    }

    const industry = await prisma.industry.create({
      data: { name, slug, isActive },
    });
    return NextResponse.json(
      { message: "Industry Created", data: industry },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST_INDUSTRY]", err);
    return NextResponse.json(
      { message: "Internal  Server Error" },
      { status: 500 },
    );
  }
}
