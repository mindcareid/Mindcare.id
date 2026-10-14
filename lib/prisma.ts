import { PrismaClient } from "@prisma/client";
import { createAuditExtension } from "@/lib/auditLog";

function createClient(): PrismaClient {
  const base = new PrismaClient();
  // Runtime memakai client yang sudah diextensi audit; tipe dijaga tetap
  // PrismaClient agar kompatibel dengan Prisma.TransactionClient dsb.
  return base.$extends(createAuditExtension(base)) as unknown as PrismaClient;
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
