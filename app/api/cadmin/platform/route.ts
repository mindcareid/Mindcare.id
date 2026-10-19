import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminGuard";
import { PLATFORM_SLUG } from "@/lib/events/constants";

/* Akun publisher platform (MindCare.id). Bukan akun login: hanya identitas
   yang dipakai event admin, jadi tidak ada kredensial yang dikelola di sini. */

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const platform = await prisma.platform.findUnique({
    where: { slug: PLATFORM_SLUG },
  });

  if (!platform) {
    return NextResponse.json(
      { message: "Platform account is not configured" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: platform });
}

export async function PUT(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json(
      { message: "Display name is required" },
      { status: 400 },
    );
  }

  const platform = await prisma.platform.update({
    where: { slug: PLATFORM_SLUG },
    data: { name },
  });

  return NextResponse.json({ success: true, data: platform });
}
