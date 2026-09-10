import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ================= GET ONE ================= */

export async function GET(
  _req: Request,
  { params }: { params: { eventId: string; fieldId: string } }
) {
  const field = await prisma.eventAttendeeField.findUnique({
    where: { id: params.fieldId },
  });

  if (!field) {
    return NextResponse.json(
      { message: "Field not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(field);
}

/* ================= UPDATE ================= */

export async function PUT(
  req: Request,
  { params }: { params: { eventId: string; fieldId: string } }
) {
  const body = await req.json();

  const {
    label,
    key,
    type,
    required,
    options,
    order,
  } = body;

  const updated = await prisma.eventAttendeeField.update({
    where: { id: params.fieldId },
    data: {
      label,
      key,
      type,
      required,
      options: options ?? null,
      sortOrder: order,
    },
  });

  return NextResponse.json(updated);
}

/* ================= DELETE ================= */

export async function DELETE(
  _req: Request,
  { params }: { params: { eventId: string; fieldId: string } }
) {
  await prisma.eventAttendeeField.delete({
    where: { id: params.fieldId },
  });

  return NextResponse.json({ success: true });
}