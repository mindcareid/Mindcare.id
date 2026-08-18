import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  const ticket = await prisma.ticket.findUnique({
    where: { code: params.code },
    select: { qrCode: true },
  });

  if (!ticket) {
    return new NextResponse("QR not found", { status: 404 });
  }

  const base64 = ticket.qrCode;

  // ambil bagian base64 saja
  const base64Data = base64.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}