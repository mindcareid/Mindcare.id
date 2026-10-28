import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminGuard";
import { PLATFORM_SLUG } from "@/lib/events/constants";
import { isPublicIdInEntityFolder } from "@/lib/cloudinary/asset";

/* Akun publisher platform (MindCare.id). Bukan akun login: hanya identitas
   yang dipakai event admin, jadi tidak ada kredensial yang dikelola di sini. */

type LogoBody = {
  logoUrl: string | null;
  logoPublicId: string | null;
};

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function logoIssues(body: Record<string, unknown>): string | null {
  const url = optionalString(body.logoUrl);
  const publicId = optionalString(body.logoPublicId);

  if (!url && !publicId) return null;
  if (!url || !publicId) {
    return "Logo image and its public id must be provided together";
  }
  if (!isPublicIdInEntityFolder(publicId, "platform")) {
    return "Logo must belong to the platform folder";
  }
  return null;
}

function resolveLogo(body: Record<string, unknown>): LogoBody {
  // Keduanya kosong/null berarti logo dihapus.
  return {
    logoUrl: optionalString(body.logoUrl),
    logoPublicId: optionalString(body.logoPublicId),
  };
}

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

  const problem = logoIssues(body);
  if (problem) {
    return NextResponse.json({ message: problem }, { status: 422 });
  }

  const logo =
    body?.logoUrl === undefined && body?.logoPublicId === undefined
      ? {}
      : resolveLogo(body);

  try {
    const platform = await prisma.platform.update({
      where: { slug: PLATFORM_SLUG },
      data: {
        name,
        // Field yang tidak dikirim tidak disentuh: pemanggil lama (hanya nama)
        // tetap bekerja tanpa menghapus logo yang sudah ada.
        ...(body?.isVerified === undefined
          ? {}
          : { isVerified: body.isVerified === true }),
        ...logo,
      },
    });

    return NextResponse.json({ success: true, data: platform });
  } catch (error) {
    console.error("[CADMIN_PLATFORM_UPDATE]", error);
    return NextResponse.json(
      { message: "Failed to update platform account" },
      { status: 500 },
    );
  }
}
