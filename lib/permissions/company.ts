import { CompanyRole } from "@prisma/client";

export const companyPermissions = {
  CARE_CENTRE: ["OWNER", "ADMIN", "EDITOR"],
  SOLUTION: ["OWNER", "ADMIN", "EDITOR"],
  EVENT: ["OWNER", "ADMIN", "EDITOR", "TRAINER"],
  COMPANY_USERS: ["OWNER", "ADMIN"],
  FINANCE: ["OWNER", "ADMIN", "FINANCE"],
} as const satisfies Record<string, readonly CompanyRole[]>;

function hasPermission(
  role: CompanyRole,
  allowedRoles: readonly CompanyRole[],
): boolean {
  return allowedRoles.includes(role);
}

export function canManageCareCentre(role: CompanyRole): boolean {
  return hasPermission(role, companyPermissions.CARE_CENTRE);
}

export function canManageSolution(role: CompanyRole): boolean {
  return hasPermission(role, companyPermissions.SOLUTION);
}

export function canManageEvent(role: CompanyRole): boolean {
  return hasPermission(role, companyPermissions.EVENT);
}

export function canManageCompanyUsers(role: CompanyRole): boolean {
  return hasPermission(role, companyPermissions.COMPANY_USERS);
}

export function canManageFinance(role: CompanyRole): boolean {
  return hasPermission(role, companyPermissions.FINANCE);
}