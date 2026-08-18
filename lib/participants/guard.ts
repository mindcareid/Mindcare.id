import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type GuardResult =
  | { ok: true; companyId: number; userId: number }
  | { ok: false; status: 401 | 403 | 404; message: string };

export async function requireCompanyEventAccess(
  eventId: number,
): Promise<GuardResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const userId = Number(session.user.id);
  const member = await prisma.companyUser.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { companyId: true, role: true },
  });

  if (!member) {
    return { ok: false, status: 403, message: "Not a Company Member" };
  }

  const canViewReports = ["OWNER", "ADMIN", "FINANCE"].includes(member.role);

  if (!canViewReports) {
    return { ok: false, status: 403, message: "Insufficient role permission" };
  }

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      companyId: member.companyId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!event) {
    return { ok: false, status: 404, message: "Event nt Found" };
  }

  return { ok: true, companyId: member.companyId, userId };
}
