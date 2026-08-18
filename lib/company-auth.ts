import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CompanyRole } from "@prisma/client";

export type CompanyMember = {
  userId: number;
  companyId: number;
  role: CompanyRole;
};

export async function getCompanyMember(
  companyId: number,
): Promise<CompanyMember | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);
  //auth company
  const member = await prisma.companyUser.findUnique({
    where: {
      userId_companyId: { userId, companyId },
    },
    select: {
      userId: true,
      companyId: true,
      role: true,
      status: true,
    },
  });

  if (!member || member.status !== "ACTIVE") return null;

  return {
    userId: member.userId,
    companyId: member.companyId,
    role: member.role,
  };
}

export function canManageEvent(role: CompanyRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function getAllowedUpdateFields(role: CompanyRole): string[] | null {
  if (role === "OWNER" || role === "ADMIN") return null;
  if (role === "TRAINER") return ["description"];
  if (role === "FINANCE") return ["price"];
  return [];
}
