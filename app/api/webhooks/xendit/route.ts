import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { Prisma, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOrderTicketEmails } from "@/lib/orders/sendTicketEmails";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

export async function POST(req: Request) {
  const callbackToken = req.headers.get("x-callback-token");
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

  if (
    !expectedToken ||
    !callbackToken ||
    !safeEqual(callbackToken, expectedToken)
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const webhookLimit = rateLimit(`webhook:${getClientIp(req)}`, 300, 60_000);

  if (!webhookLimit.ok) {
    return NextResponse.json(
      { message: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(Math.ceil((webhookLimit.resetAt - Date.now()) / 1000), 1),
          ),
        },
      },
    );
  }

  const rawBody = await req.text();

  let body: {
    id?: string;
    status?: string;
    amount?: number;
    paid_amount?: number;
    currency?: string;
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status; // PAID | EXPIRED
  const invoiceId = body.id; // invoice.id

  if (!invoiceId || !status) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus !== "PAID" && normalizedStatus !== "EXPIRED") {
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findUnique({
    where: { invoiceId },
    include: { event: true },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found" });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ received: true });
  }
  if (normalizedStatus === "PAID") {
    const paidAmount =
      typeof body.paid_amount === "number" ? body.paid_amount : body.amount;
    const paidCurrency =
      typeof body.currency === "string" ? body.currency : order.currency;

    if (paidAmount !== order.amount || paidCurrency !== order.currency) {
      await prisma.paymentLog.create({
        data: {
          orderId: order.id,
          provider: "XENDIT",
          status: PaymentStatus.FAILED,
          payload: body as Prisma.InputJsonValue,
        },
      });

      console.error(
        "[XENDIT_WEBHOOK] Amount/currency mismatch, order not marked paid",
        {
          orderId: order.id,
          invoiceId,
          expectedAmount: order.amount,
          paidAmount,
          expectedCurrency: order.currency,
          paidCurrency,
        },
      );

      return NextResponse.json({ received: true });
    }
  }

  await prisma.paymentLog.create({
    data: {
      orderId: order.id,
      provider: "XENDIT",
      status:
        normalizedStatus === "PAID"
          ? PaymentStatus.PAID
          : PaymentStatus.EXPIRED,
      payload: body as Prisma.InputJsonValue,
    },
  });

  if (normalizedStatus === "PAID") {
    const transition = await prisma.order.updateMany({
      where: { id: order.id, status: "PENDING" },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    if (transition.count === 0) {
      return NextResponse.json({ received: true });
    }

    if (order.event.externalUrl) {
      console.error("[XENDIT_WEBHOOK] Paid invoice on external event", {
        orderId: order.id,
        eventId: order.eventId,
        invoiceId,
        amount: order.amount,
      });
      return NextResponse.json({ received: true });
    }
    await sendOrderTicketEmails(order.id);

    return NextResponse.json({ received: true });
  }

  if (normalizedStatus === "EXPIRED") {
    await prisma.order.updateMany({
      where: { id: order.id, status: "PENDING" },
      data: { status: "EXPIRED" },
    });
  }

  return NextResponse.json({ received: true });
}
