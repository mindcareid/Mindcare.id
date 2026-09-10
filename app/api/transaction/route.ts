// app/api/transaction/route.ts

export const dynamic = "force-dynamic";

import { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const XENDIT_API_URL = "https://api.xendit.co";

function getXenditAuthHeader(): HeadersInit {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  const forUserId = process.env.XENDIT_FOR_USER_ID;

  if (!secretKey) {
    throw new Error("XENDIT_SECRET_KEY is not configured");
  }

  if (!forUserId) {
    throw new Error("XENDIT_FOR_USER_ID is not configured");
  }

  const credentials = Buffer.from(
    `${secretKey}:`,
  ).toString("base64");

  return {
    Authorization: `Basic ${credentials}`,
    "for-user-id": forUserId,
    Accept: "application/json",
  };
}

/**
 * Xendit invoice status.
 *
 * Status ini adalah status dari provider,
 * bukan status database kita.
 */
type XenditInvoiceStatus =
  | "PENDING"
  | "PAID"
  | "SETTLED"
  | "EXPIRED"
  | "FAILED"
  | "CANCELED"
  | "CANCELLED"
  | "REFUNDED"
  | "UNKNOWN";

/**
 * Convert unknown value menjadi XenditInvoiceStatus.
 */
function parseXenditStatus(
  value: unknown,
): XenditInvoiceStatus {
  if (typeof value !== "string") {
    return "UNKNOWN";
  }

  switch (value.toUpperCase()) {
    case "PENDING":
      return "PENDING";

    case "PAID":
      return "PAID";

    case "SETTLED":
      return "SETTLED";

    case "EXPIRED":
      return "EXPIRED";

    case "FAILED":
      return "FAILED";

    case "CANCELED":
      return "CANCELED";

    case "CANCELLED":
      return "CANCELLED";

    case "REFUNDED":
      return "REFUNDED";

    default:
      return "UNKNOWN";
  }
}

/**
 * Map status Xendit ke status internal database.
 *
 * Xendit:
 *   PAID / SETTLED -> PAID
 *   EXPIRED        -> EXPIRED
 *   FAILED         -> FAILED
 *   CANCELED       -> CANCELED
 *   REFUNDED       -> REFUNDED
 *   lainnya        -> PENDING
 */
function mapToPaymentStatus(
  status: XenditInvoiceStatus,
): PaymentStatus {
  switch (status) {
    case "PAID":
    case "SETTLED":
      return PaymentStatus.PAID;

    case "EXPIRED":
      return PaymentStatus.EXPIRED;

    case "FAILED":
      return PaymentStatus.FAILED;

    case "CANCELED":
    case "CANCELLED":
      return PaymentStatus.CANCELED;

    case "REFUNDED":
      return PaymentStatus.REFUNDED;

    case "PENDING":
    case "UNKNOWN":
    default:
      return PaymentStatus.PENDING;
  }
}

/**
 * Pastikan response Xendit merupakan JSON object
 * yang bisa disimpan sebagai Prisma JSON.
 */
function parseInvoiceJson(
  value: unknown,
): Prisma.InputJsonObject | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as Prisma.InputJsonObject;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const orderId = searchParams.get("order_id");

    // ============================================================
    // VALIDATE ORDER ID
    // ============================================================

    if (!orderId || !orderId.trim()) {
      return NextResponse.json(
        {
          message: "Missing order_id",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // GET ORDER
    // ============================================================

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          message: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================================
    // FINAL DATABASE STATUS
    // ============================================================

    /**
     * Kalau order sudah final, tidak perlu
     * request ulang ke Xendit.
     */
    if (
      order.status === PaymentStatus.PAID ||
      order.status === PaymentStatus.EXPIRED ||
      order.status === PaymentStatus.CANCELED ||
      order.status === PaymentStatus.REFUNDED
    ) {
      return NextResponse.json({
        success: true,
        status: order.status,
      });
    }

    // ============================================================
    // CHECK INVOICE
    // ============================================================

    if (!order.invoiceId) {
      return NextResponse.json(
        {
          message: "Invoice not found",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // FETCH XENDIT INVOICE
    // ============================================================

    const invoiceUrl =
      `${XENDIT_API_URL}/v2/invoices/` +
      encodeURIComponent(order.invoiceId);

    const res = await fetch(invoiceUrl, {
      method: "GET",
      headers: getXenditAuthHeader(),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();

      console.error(
        "[XENDIT_INVOICE_ERROR]",
        {
          status: res.status,
          orderId: order.id,
          invoiceId: order.invoiceId,
          response: errorText,
        },
      );

      return NextResponse.json(
        {
          message: "Failed to fetch invoice",
        },
        {
          status: 502,
        },
      );
    }

    // ============================================================
    // PARSE XENDIT RESPONSE
    // ============================================================

    const rawInvoice: unknown = await res.json();

    const invoice = parseInvoiceJson(rawInvoice);

    if (!invoice) {
      console.error(
        "[XENDIT_INVALID_RESPONSE]",
        {
          orderId: order.id,
          invoiceId: order.invoiceId,
        },
      );

      return NextResponse.json(
        {
          message: "Invalid invoice response from Xendit",
        },
        {
          status: 502,
        },
      );
    }

    // ============================================================
    // GET XENDIT STATUS
    // ============================================================

    const xenditStatus = parseXenditStatus(
      invoice.status,
    );

    // ============================================================
    // MAP TO INTERNAL PAYMENT STATUS
    // ============================================================

    const paymentStatus = mapToPaymentStatus(
      xenditStatus,
    );

    // ============================================================
    // SAVE PAYMENT LOG
    // ============================================================

    /**
     * Hindari membuat log yang sama berkali-kali
     * ketika frontend melakukan polling.
     */
    const existingLog =
      await prisma.paymentLog.findFirst({
        where: {
          orderId: order.id,
          provider: "XENDIT",
          status: paymentStatus,
        },
        select: {
          id: true,
        },
      });

    if (!existingLog) {
      try {
        await prisma.paymentLog.create({
          data: {
            orderId: order.id,
            provider: "XENDIT",
            status: paymentStatus,
            payload: invoice,
          },
        });
      } catch (logError) {
        /**
         * Payment log gagal tidak boleh membuat
         * polling payment gagal.
         */
        console.error(
          "[PAYMENT_LOG_ERROR]",
          logError,
        );
      }
    }

    // ============================================================
    // HANDLE PAID
    // ============================================================

    if (paymentStatus === PaymentStatus.PAID) {
      await prisma.order.updateMany({
        where: {
          id: order.id,
          status: OrderStatus.PENDING,
        },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        status: PaymentStatus.PAID,
        xenditStatus,
      });
    }

    // ============================================================
    // HANDLE EXPIRED
    // ============================================================

    if (
      paymentStatus === PaymentStatus.EXPIRED
    ) {
      await prisma.order.updateMany({
        where: {
          id: order.id,
          status: OrderStatus.PENDING,
        },
        data: {
          status: OrderStatus.EXPIRED,
        },
      });

      return NextResponse.json({
        success: true,
        status: PaymentStatus.EXPIRED,
        xenditStatus,
      });
    }


    // ============================================================
    // HANDLE CANCELED
    // ============================================================

    if (
      paymentStatus === PaymentStatus.CANCELED
    ) {
      await prisma.order.updateMany({
        where: {
          id: order.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.CANCELED,
        },
      });

      return NextResponse.json({
        success: true,
        status: PaymentStatus.CANCELED,
        xenditStatus,
      });
    }

    // ============================================================
    // HANDLE REFUNDED
    // ============================================================

    if (
      paymentStatus === PaymentStatus.REFUNDED
    ) {
      await prisma.order.updateMany({
        where: {
          id: order.id,
        },
        data: {
          status: OrderStatus.REFUNDED,
        },
      });

      return NextResponse.json({
        success: true,
        status: PaymentStatus.REFUNDED,
        xenditStatus,
      });
    }

    // ============================================================
    // PENDING / UNKNOWN
    // ============================================================

    return NextResponse.json({
      success: true,
      status: PaymentStatus.PENDING,
      xenditStatus,
    });
  } catch (error) {
    console.error(
      "[TRANSACTION_GET_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}

