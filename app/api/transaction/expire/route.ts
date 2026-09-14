export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { Prisma, PaymentStatus } from "@prisma/client";

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;

function getXenditAuthHeader(): HeadersInit {
  if (!XENDIT_SECRET_KEY) {
    throw new Error("XENDIT_SECRET_KEY is not configured");
  }

  const encodedCredentials = Buffer.from(
    `${XENDIT_SECRET_KEY}:`,
  ).toString("base64");

  return {
    Authorization: `Basic ${encodedCredentials}`,
    Accept: "application/json",
  };
}

/**
 * Normalize status dari Xendit menjadi PaymentStatus
 *
 * Xendit:
 * - PAID
 * - SETTLED
 * - EXPIRED
 *
 * Database:
 * - PENDING
 * - PAID
 * - EXPIRED
 * - CANCELED
 */

function normalizePaymentStatus(
  xenditStatus: string,
): PaymentStatus {
  switch (xenditStatus.toUpperCase()) {
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

    default:
      return PaymentStatus.PENDING;
  }
}

/**
 * Ambil status Xendit sebagai string untuk response/logging.
 */
function getXenditStatus(
  invoice: Prisma.InputJsonValue,
): string {
  if (
    typeof invoice === "object" &&
    invoice !== null &&
    !Array.isArray(invoice) &&
    "status" in invoice
  ) {
    const status = invoice.status;

    if (typeof status === "string") {
      return status.toUpperCase();
    }
  }

  return "UNKNOWN";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const orderId = searchParams.get("order_id");

    // ============================================================
    // EXPIRE PENDING ORDERS > 24 JAM
    // ============================================================

    if (!orderId) {
      const now = new Date();

      const expirationLimit = new Date(
        now.getTime() - 24 * 60 * 60 * 1000,
      );

      const expired = await prisma.order.updateMany({
        where: {
          status: PaymentStatus.PENDING,
          createdAt: {
            lte: expirationLimit,
          },
        },
        data: {
          status: PaymentStatus.EXPIRED,
        },
      });

      console.log(
        `[TRANSACTION_EXPIRE] Marked ${expired.count} PENDING orders as EXPIRED`,
      );

      return NextResponse.json({
        success: true,
        message: `Marked ${expired.count} PENDING orders as EXPIRED`,
        count: expired.count,
      });
    }

    // ============================================================
    // VALIDATE ORDER ID
    // ============================================================

    if (!orderId.trim()) {
      return NextResponse.json(
        {
          message: "Order ID is required",
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
    // ORDER ALREADY PAID
    // ============================================================

    if (order.status === PaymentStatus.PAID) {
      return NextResponse.json({
        success: true,
        status: PaymentStatus.PAID,
      });
    }

    // ============================================================
    // ORDER ALREADY EXPIRED
    // ============================================================

    if (order.status === PaymentStatus.EXPIRED) {
      return NextResponse.json({
        success: true,
        status: PaymentStatus.EXPIRED,
      });
    }

    // ============================================================
    // CHECK INVOICE ID
    // ============================================================

    if (!order.invoiceId) {
      return NextResponse.json(
        {
          message: "Invoice not found on order",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // FETCH INVOICE FROM XENDIT
    // ============================================================

    const xenditUrl = `https://api.xendit.co/v2/invoices/${encodeURIComponent(
      order.invoiceId,
    )}`;

    const res = await fetch(xenditUrl, {
      method: "GET",
      headers: getXenditAuthHeader(),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();

      console.error(
        "[XENDIT_INVOICE_ERROR]",
        res.status,
        errorText,
      );

      return NextResponse.json(
        {
          message: "Failed to fetch invoice from Xendit",
        },
        {
          status: 502,
        },
      );
    }

    const invoice: Prisma.InputJsonValue = await res.json();

    // ============================================================
    // XENDIT STATUS
    // ============================================================

    const xenditStatus = getXenditStatus(invoice);

    /**
     * Normalize:
     *
     * Xendit PAID    -> Prisma PAID
     * Xendit SETTLED -> Prisma PAID
     * Xendit EXPIRED -> Prisma EXPIRED
     * lainnya        -> Prisma PENDING
     */
    const paymentStatus = normalizePaymentStatus(
      xenditStatus,
    );

    // ============================================================
    // SAVE PAYMENT LOG
    // ============================================================

    const existingLog = await prisma.paymentLog.findFirst({
      where: {
        orderId: order.id,
        status: paymentStatus,
        provider: "XENDIT",
      },
    });

    if (!existingLog) {
      await prisma.paymentLog.create({
        data: {
          orderId: order.id,
          provider: "XENDIT",
          status: paymentStatus,
          payload: invoice,
        },
      });
    }

    // ============================================================
    // HANDLE PAID
    // ============================================================

    if (paymentStatus === PaymentStatus.PAID) {
      await prisma.$transaction(async (tx) => {
        /**
         * Hanya update kalau order masih PENDING.
         *
         * Ini membantu menghindari overwrite status
         * kalau request polling datang bersamaan.
         */
        await tx.order.updateMany({
          where: {
            id: order.id,
            status: PaymentStatus.PENDING,
          },
          data: {
            status: PaymentStatus.PAID,
            paidAt: new Date(),
          },
        });
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

    if (paymentStatus === PaymentStatus.EXPIRED) {
      await prisma.order.updateMany({
        where: {
          id: order.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.EXPIRED,
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

    if (paymentStatus === PaymentStatus.CANCELED) {
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

