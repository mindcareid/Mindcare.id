import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/* ================= HELPERS ================= */

function generateFieldKey(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const ALLOWED_TYPES = [
  "TEXT",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "DATE",
  "SELECT",
] as const;

type AttendeeFieldType = (typeof ALLOWED_TYPES)[number];

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

/* ================= CREATE ================= */

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = Number(params.id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid eventId" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      label,
      key,
      type,
      required = false,
      options,
      order = 0,
    } = body;

    /* ===== validation ===== */
    if (!label || !type) {
      return NextResponse.json(
        { message: "Label and type are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { message: "Invalid field type" },
        { status: 400 }
      );
    }

    /* ===== key ===== */
    const safeFieldKey =
      typeof key === "string" && key.trim().length > 0
        ? key
        : generateFieldKey(label);

    /* ===== options ===== */
    let safeOptions: string[] | null = null;

    if (type === "SELECT") {
      if (!Array.isArray(options) || options.length === 0) {
        return NextResponse.json(
          { message: "Options are required for SELECT type" },
          { status: 400 }
        );
      }

      safeOptions = options
        .map((o: string) => o.trim())
        .filter(Boolean);
    }

    const field = await prisma.eventAttendeeField.create({
      data: {
        eventId,
        label,
        key: safeFieldKey,
        type: type as AttendeeFieldType,
        required: Boolean(required),
        order: Number(order) || 0,
        options:
          safeOptions !== null
            ? safeOptions
            : Prisma.JsonNull,
      },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    console.error("CREATE ATTENDEE FIELD ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}