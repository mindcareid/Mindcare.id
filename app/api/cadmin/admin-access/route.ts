import { NextRequest, NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import {
  countActiveSuperadmins,
  getAdminUser,
  getSuperadmin,
} from "@/lib/adminGuard";
import prisma from "@/lib/prisma";

const ADMIN_ROLES = [AdminRole.ADMIN, AdminRole.SUPERADMIN] as const;

function parseRole(value: unknown): AdminRole | null {
  return ADMIN_ROLES.includes(value as AdminRole)
    ? (value as AdminRole)
    : null;
}

/**
 * GET — daftar akses admin. Butuh admin (bukan cuma superadmin) supaya
 * daftar user bisa menampilkan status admin.
 */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const accesses = await prisma.adminAccess.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      userId: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { name: true, email: true, username: true } },
    },
  });

  return NextResponse.json({ data: accesses });
}

/**
 * POST — angkat atau ubah role admin. SUPERADMIN saja.
 * Body: { userId: number, role: "ADMIN" | "SUPERADMIN" }
 */
export async function POST(req: NextRequest) {
  const superadmin = await getSuperadmin();
  if (!superadmin) {
    return NextResponse.json(
      { message: "Only a superadmin can manage admin access" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const userId = Number(body?.userId);
  const role = parseRole(body?.role);

  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
  }

  if (!role) {
    return NextResponse.json(
      { message: "role must be ADMIN or SUPERADMIN" },
      { status: 400 },
    );
  }

  // Jangan biarkan superadmin menurunkan dirinya sendiri secara tidak sengaja.
  if (userId === superadmin.userId && role !== AdminRole.SUPERADMIN) {
    return NextResponse.json(
      { message: "You cannot change your own superadmin role" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, isActive: true, deletedAt: null },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { message: "User not found or inactive" },
      { status: 404 },
    );
  }

  const access = await prisma.adminAccess.upsert({
    where: { userId },
    create: { userId, role, isActive: true },
    update: { role, isActive: true },
  });

  return NextResponse.json({ message: "Admin access granted", data: access });
}

/**
 * DELETE — cabut akses admin (isActive=false, akun user tetap ada).
 * SUPERADMIN saja, tidak boleh mencabut akses sendiri, dan tidak boleh
 * menghabiskan superadmin terakhir.
 * Query: ?userId=1
 */
export async function DELETE(req: NextRequest) {
  const superadmin = await getSuperadmin();
  if (!superadmin) {
    return NextResponse.json(
      { message: "Only a superadmin can manage admin access" },
      { status: 403 },
    );
  }

  const userId = Number(new URL(req.url).searchParams.get("userId"));
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
  }

  if (userId === superadmin.userId) {
    return NextResponse.json(
      { message: "You cannot revoke your own admin access" },
      { status: 400 },
    );
  }

  const access = await prisma.adminAccess.findUnique({ where: { userId } });
  if (!access || !access.isActive) {
    return NextResponse.json(
      { message: "User is not an active admin" },
      { status: 404 },
    );
  }

  if (
    access.role === AdminRole.SUPERADMIN &&
    (await countActiveSuperadmins(userId)) === 0
  ) {
    return NextResponse.json(
      { message: "Cannot revoke the last active superadmin" },
      { status: 400 },
    );
  }

  const updated = await prisma.adminAccess.update({
    where: { userId },
    data: { isActive: false },
  });

  return NextResponse.json({ message: "Admin access revoked", data: updated });
}
