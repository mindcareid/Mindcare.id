import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminRole } from "@prisma/client";
import { resolveAdminRole } from "@/lib/adminAccess";

export type AdminAccessInfo = {
  userId: number;
  name: string;
  role: AdminRole;
};

/**
 * Otorisasi admin dibaca dari tabel `AdminAccess`, bukan `User.role`.
 * Akun nonaktif atau terhapus otomatis tidak sah, walau barisnya masih ada.
 */
export async function findAdminAccess(
  userId: number,
): Promise<AdminAccessInfo | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId, isActive: true, deletedAt: null },
    select: {
      id: true,
      name: true,
      role: true,
      adminAccess: { select: { role: true, isActive: true } },
    },
  });

  if (!user) return null;

  const role = resolveAdminRole(user.adminAccess, user.role);
  if (!role) return null;

  return { userId: user.id, name: user.name, role };
}

export async function getAdminAccess(): Promise<AdminAccessInfo | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number(session.user.id) : NaN;
  if (!Number.isFinite(userId)) return null;

  return findAdminAccess(userId);
}

export async function getSuperadmin(): Promise<AdminAccessInfo | null> {
  const access = await getAdminAccess();
  if (!access || access.role !== AdminRole.SUPERADMIN) return null;
  return access;
}

/**
 * Anti-lockout: dipakai sebelum menurunkan/menghapus superadmin untuk
 * memastikan masih ada superadmin aktif lain selain user yang disentuh.
 */
export async function countActiveSuperadmins(
  excludeUserId?: number,
): Promise<number> {
  return prisma.adminAccess.count({
    where: {
      role: AdminRole.SUPERADMIN,
      isActive: true,
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
      user: { isActive: true, deletedAt: null },
    },
  });
}

/**
 * Kompatibilitas route cadmin lama yang hanya butuh "admin atau bukan".
 * `role` di sini bertipe AdminRole, bukan UserRole.
 */
export async function getAdminUser() {
  const access = await getAdminAccess();
  if (!access) return null;

  return { id: access.userId, name: access.name, role: access.role };
}

export function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}
