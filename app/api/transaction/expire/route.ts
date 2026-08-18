// app/api/transaction/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY!;

function getXenditAuthHeader() {
  return {
    Authorization: `Basic ${Buffer.from(
      `${XENDIT_SECRET_KEY}:`
    ).toString("base64")}`,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    // ================= EXPIRE PENDING ORDERS >24 JAM =================
    if (!orderId) {
      const now = new Date();
      const expired = await prisma.order.updateMany({
        where: {
          status: "PENDING",
          createdAt: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
        data: { status: "EXPIRED" },
      });

      console.log(`[TRANSACTION_EXPIRE] Marked ${expired.count} PENDING orders as EXPIRED`);
      return NextResponse.json({
        success: true,
        message: `Marked ${expired.count} PENDING orders as EXPIRED`,
        count: expired.count,
      });
    }

    // ================= POLLING ORDER SPESIFIK =================
    // ambil order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { ticket: true },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // kalau sudah PAID → return
    if (order.status === "PAID") {
      return NextResponse.json({ status: "PAID" });
    }

    if (!order.invoiceId) {
      return NextResponse.json(
        { message: "Invoice not found on order" },
        { status: 400 }
      );
    }

    // cek invoice ke Xendit
    const res = await fetch(
      `https://api.xendit.co/v2/invoices/${order.invoiceId}`,
      { headers: getXenditAuthHeader() }
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Failed to fetch invoice from Xendit" },
        { status: 502 }
      );
    }

    const invoice = await res.json();
    const status: string = invoice.status;

    // simpan polling log (hindari duplikasi)
    const existingLog = await prisma.paymentLog.findFirst({
      where: {
        orderId: order.id,
        status,
        provider: "XENDIT",
      },
    });

    if (!existingLog) {
      await prisma.paymentLog.create({
        data: {
          orderId: order.id,
          provider: "XENDIT",
          status,
          payload: invoice,
        },
      });
    }

    // handle status invoice
    if (status === "PAID" || status === "SETTLED") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID", paidAt: new Date() },
        });
      });
    }

    if (status === "EXPIRED") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "EXPIRED" },
      });
    }

    return NextResponse.json({ status });
  } catch (error) {
    console.error("[TRANSACTION_GET_ERROR]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}