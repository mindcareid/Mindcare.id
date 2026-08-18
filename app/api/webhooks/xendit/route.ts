import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/email";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const body = JSON.parse(rawBody);

  const status = body.status;        // PAID | EXPIRED
  const invoiceId = body.id;         // invoice.id

  if (!invoiceId || !status) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { invoiceId },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found" });
  }

  // idempotent guard
  if (order.status === "PAID") {
    return NextResponse.json({ received: true });
  }

  await prisma.$transaction(async (tx) => {
    // log webhook
    await tx.paymentLog.create({
      data: {
        orderId: order.id,
        provider: "XENDIT",
        status,
        payload: body,
      },
    });

    if (status === "PAID") {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
        include: {
          ticket: true,
          event: true,
        },
      });
      if (updatedOrder.event.externalUrl) {
        console.error("[XENDIT_WEBHOOK] Paid invoice on external event", {
          orderId: updatedOrder.id,
          eventId: updatedOrder.eventId,
          invoiceId,
          amount: updatedOrder.amount,
        });
        return;
      }

      // TODO: generate ticket di sini
      await Promise.all(
        updatedOrder.ticket.map((t) =>
          sendTicketEmail({
            to: t.attendeeEmail,
            eventTitle: updatedOrder.event.title,
            qrCode: t.code,
          }),
        ),
      );
    }

    if (status === "EXPIRED") {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "EXPIRED",
        },
      });
    }
  });

  return NextResponse.json({ received: true });
}