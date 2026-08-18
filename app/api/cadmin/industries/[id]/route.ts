import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { z } from "zod";

const UpdateIndustrySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  isActive: z.boolean().optional(),
});

import { Prisma } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON Body!" },
      { status: 400 },
    );
  }

  const parsed = UpdateIndustrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation Failed!", errors: z.treeifyError(parsed.error) },
      { status: 422 },
    );
  }

  const { name, isActive } = parsed.data;

  try {
    const industry = await prisma.industry.update({
      where: { id },
      data: {
        ...(name && {
          name,
          slug: slugify(name, { lower: true, strict: true }),
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ message: "Industry Updated!", data: industry });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json(
          { message: "Industry name already exists, please check again" },
          { status: 409 },
        );
      }
      if (err.code === "P2025") {
        return NextResponse.json(
          { message: "Industry not found" },
          { status: 404 },
        );
      }
    }

    console.error("[PATCH_INDUSTRY]", err);
    return NextResponse.json(
      { message: "Internal Server Error!" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    await prisma.industry.delete({ where: { id } });
    return NextResponse.json({ message: "Industry Deleted Succes!" });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Industry not found" },
        { status: 404 },
      );
    }

    console.error("[DELETE_INDUSTRY]", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
