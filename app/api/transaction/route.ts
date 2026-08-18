// app/api/transaction/route.ts

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TransactionStatus =
  | "PENDING"
  | "PAID"
  | "SETTLED"
  | "EXPIRED";

function getXenditAuthHeader() {
  return {
    Authorization: `Basic ${Buffer.from(
      `${process.env.XENDIT_SECRET_KEY}:`
    ).toString("base64")}`,
    "for-user-id": process.env.XENDIT_FOR_USER_ID!,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json(
        { message: "Missing order_id" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    /**
     * kalau status sudah final
     * tidak perlu request lagi ke Xendit
     */
    if (
      order.status === "PAID" ||
      order.status === "EXPIRED" 
    ) {
      return NextResponse.json({
        status: order.status,
      });
    }

    if (!order.invoiceId) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.xendit.co/v2/invoices/${order.invoiceId}`,
      {
        headers: getXenditAuthHeader(),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        {
          message: "Failed to fetch invoice",
        },
        {
          status: 502,
        }
      );
    }

    const invoice = await res.json();

    const status = invoice.status as TransactionStatus;

    await prisma.paymentLog.create({
      data: {
        orderId: order.id,
        provider: "XENDIT",
        status,
        payload: invoice,
      },
    }).catch(() => {});

    switch (status) {
      case "PAID":
      case "SETTLED":
        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

        return NextResponse.json({
          status: "PAID",
        });

      case "EXPIRED":
        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "EXPIRED",
          },
        });

        return NextResponse.json({
          status: "EXPIRED",
        });

      default:
        return NextResponse.json({
          status: "PENDING",
        });
    }
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}