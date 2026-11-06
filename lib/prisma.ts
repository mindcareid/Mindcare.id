import { PrismaClient } from "@prisma/client";
// Sementara dinonaktifkan: extension audit menulis log lewat client `base`
// (bukan `tx`) sehingga membuka koneksi lain di tengah `$transaction` dan
// memicu P2028 "Transaction not found" di Vercel. Aktifkan lagi setelah
// penulisan log ikut transaksi.
// import { createAuditExtension } from "@/lib/auditLog";

function createClient(): PrismaClient {
  const base = new PrismaClient();
  // Tanpa extension audit untuk sementara.
  // return base.$extends(createAuditExtension(base)) as unknown as PrismaClient;
  return base;
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
