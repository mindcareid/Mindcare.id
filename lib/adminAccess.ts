import { AdminRole, UserRole } from "@prisma/client";

export type AdminAccessRecord =
  | {
      role: AdminRole;
      isActive: boolean;
    }
  | null
  | undefined;

const LEGACY_ADMIN_ROLES: readonly string[] = [
  UserRole.ADMIN,
  UserRole.SUPERADMIN,
  "ADMIN",
  "SUPERADMIN",
];

/**
 * Sumber otorisasi admin adalah baris `AdminAccess`. Selama baris itu ada,
 * ia yang menang: `isActive=false` berarti dicabut walau `User.role` lama
 * masih ADMIN. Fallback ke `User.role` hanya berlaku sebelum backfill —
 * begitu ada baris, keputusan eksplisit tidak boleh ditimpa data lama.
 */
export function resolveAdminRole(
  adminAccess: AdminAccessRecord,
  legacyUserRole: UserRole | string | null | undefined,
): AdminRole | null {
  if (adminAccess) {
    return adminAccess.isActive ? adminAccess.role : null;
  }

  if (!legacyUserRole || !LEGACY_ADMIN_ROLES.includes(legacyUserRole)) {
    return null;
  }

  return legacyUserRole === UserRole.SUPERADMIN || legacyUserRole === "SUPERADMIN"
    ? AdminRole.SUPERADMIN
    : AdminRole.ADMIN;
}

/**
 * Role yang dipakai untuk izin folder Cloudinary. `adminRole` menang; kalau
 * tidak ada, role ADMIN/SUPERADMIN lama tidak memberi hak apa pun (jatuh ke
 * USER) supaya admin yang sudah dicabut tidak diam-diam tetap bisa upload.
 */
export function resolveFolderRole(user: {
  adminRole?: AdminRole | null;
  role?: UserRole | string | null;
}): string | undefined {
  if (
    user.adminRole === AdminRole.ADMIN ||
    user.adminRole === AdminRole.SUPERADMIN
  ) {
    return user.adminRole;
  }

  if (user.role && LEGACY_ADMIN_ROLES.includes(user.role)) {
    return UserRole.USER;
  }

  return user.role ?? undefined;
}
