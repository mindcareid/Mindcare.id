export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: Number(session.user.id),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5, // dashboard latest orders
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        paidAt: true,

        invoiceUrl: true,

        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },

        ticket: {
          select: {
            id: true,
            attendeeName: true,
            attendeeEmail: true,
            code: true,
            qrCode: true,
            isCheckedIn: true,
          },
        },

        _count: {
          select: {
            ticket: true,
          },
        },
      },
    });

    const formatted = orders.map((order) => ({
      id: order.id,

      amount: order.amount,
      currency: order.currency,
      status: order.status,

      createdAt: order.createdAt,
      paidAt: order.paidAt,

      invoiceUrl: order.invoiceUrl,

      ticketCount: order._count.ticket,

      event: order.event,

      tickets: order.ticket,
    }));

    return NextResponse.json({
      orders: formatted,
    });
  } catch (error) {
    console.error("GET orders error:", error);

    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}