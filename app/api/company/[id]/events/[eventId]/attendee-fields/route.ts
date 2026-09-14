import { canManageEvent, getCompanyMember } from "@/lib/company-auth";
import prisma from "@/lib/prisma";
import { AttendeeFieldSchema } from "@/lib/validations/auth";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import z from "zod";
//GET-- Receive all data field AttendeeFields
export async function GET(
  req: Request,
  { params }: { params: { id: string; eventId: string } },
) {
  const companyId = Number(params.id);
  const eventId = Number(params.eventId);

  const member = await getCompanyMember(companyId);
  if (!member) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const fields = await prisma.eventAttendeeField.findMany({
    where: {
      eventId,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
  return NextResponse.json({ data: fields });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string; eventId: string } },
) {
  const companyId = Number(params.id);
  const eventId = Number(params.eventId);

  const member = await getCompanyMember(companyId);
  if (!member) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!canManageEvent(member.role)) {
    return NextResponse.json(
      { message: "Access denied. Only the Owner and Admin can edit this. " },
      { status: 403 },
    );
  }

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      companyId,
      deletedAt: null,
    },
  });
  if (!event) {
    return NextResponse.json({ message: "Event not found!" }, { status: 404 });
  }

  const body: unknown = await req.json();
  const parsed = AttendeeFieldSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed!", errors: parsed.error.issues },
      { status: 422 },
    );
  }
  const field = await prisma.eventAttendeeField.create({
    data: {
      eventId,
      label: parsed.data.label,
      key: parsed.data.key,
      type: parsed.data.type,
      required: parsed.data.required,
      options: parsed.data.options ?? Prisma.JsonNull,
      sortOrder: parsed.data.order,
    },
  });

  return NextResponse.json({ data: field }, { status: 201 });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string; eventId: string } },
) {
  const companyId = Number(params.id);
  const eventId = Number(params.eventId);

  const member = await getCompanyMember(companyId);
  if (!member) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!canManageEvent(member.role)) {
    return NextResponse.json(
      { message: "Access denied. Only the Owner and Admin can edit this." },
      { status: 403 },
    );
  }
  const body: unknown = await req.json();

  const parsed = z.array(AttendeeFieldSchema).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation Failed!",
        errors: parsed.error.issues,
      },
      { status: 422 },
    );
  }

  await prisma.$transaction([
    prisma.eventAttendeeField.deleteMany({ where: { eventId } }),
    prisma.eventAttendeeField.createMany({
      data: parsed.data.map((field, i) => ({
        eventId,
        label: field.label,
        key: field.key,
        type: field.type,
        required: field.required,
        options: field.options ?? Prisma.JsonNull,
        sortOrder: i,
      })),
    }),
  ]);

  const fields = await prisma.eventAttendeeField.findMany({
    where: { eventId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ data: fields });
}
