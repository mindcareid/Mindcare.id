import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ================= GET LIST ================= */

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const eventId = Number(params.id);

  if (isNaN(eventId)) {
    return NextResponse.json(
      { message: "Invalid eventId" },
      { status: 400 }
    );
  }

  const fields = await prisma.eventAttendeeField.findMany({
    where: { eventId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ data: fields });
}