import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { UpdateCompanyScehma } from "@/lib/validations/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import slugify from "slugify";
import z from "zod";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const company = await prisma.company.findUnique({
    where: { id: Number(params.id) },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logo: true,
      publicId: true,
      location: true,
      email: true,
      phone: true,
      website: true,
      instagram: true,
      linkedln: true,
      isActive: true,
    },
  });

  if (!company) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: company });
}

//HANYA OWNER YANG BISA MENG-EDIT COMPANY PROFILE
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const companyId = Number(params.id);

  const member = await prisma.companyUser.findFirst({
    where: {
      companyId,
      userId: Number(session.user.id),
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  if (!member) {
    return NextResponse.json(
      {
        message: "Forbidden: Only Owner can edit company",
      },
      { status: 403 },
    );
  }
  const body: unknown = await req.json();

  const parsed = UpdateCompanyScehma.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed!", errors: z.treeifyError(parsed.error) },
      { status: 422 },
    );
  }

  const {
    name,
    description,
    logo,
    location,
    email,
    phone,
    website,
    instagram,
    linkedln,
  } = parsed.data;

  const existingCompany = await prisma.company.findUnique({
    where: { id: Number(params.id) },
    select: { publicId: true },
  });

  if (
    existingCompany?.publicId &&
    parsed.data.publicId &&
    existingCompany.publicId !== parsed.data.publicId
  ) {
    await cloudinary.uploader.destroy(existingCompany.publicId);
  }
  const company = await prisma.company.update({
    where: { id: Number(params.id) },
    data: {
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description,
      logo: logo ?? null,
      publicId: parsed.data.publicId ?? null,
      location: location || null,
      email: email || null,
      phone: phone || null,
      website: website || null,
      instagram: instagram || null,
      linkedln: linkedln || null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      isActive: true,
      location: true,
      website: true,
      phone: true,
      email: true,
      instagram: true,
      linkedln: true,
    },
  });

  return NextResponse.json({ data: company });
}
