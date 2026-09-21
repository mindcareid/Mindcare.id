import { CompanyRole, CompanyUserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getCompanyUser(
  userId: number,
  companyId: number,
) {
  return prisma.companyUser.findFirst({
    where: {
      userId,
      companyId,
      status: CompanyUserStatus.ACTIVE,
      company: {
        isActive: true,
        deletedAt: null,
      },
    },
  });
}

export async function authorizeCompanyRole(
  userId: number,
  companyId: number,
  allowedRoles: readonly CompanyRole[],
) {
  const companyUser = await getCompanyUser(userId, companyId);

  if (!companyUser) {
    return null;
  }

  if (!allowedRoles.includes(companyUser.role)) {
    return null;
  }

  return companyUser;
}