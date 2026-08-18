import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createXenditInvoice } from "@/lib/xendit";
import { generateTicket } from "@/lib/ticket";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendTicketEmail } from "@/lib/mail";
import { OrderError } from "@/lib/orders/OrderError";
import { formatTime, formatDate } from "@/lib/utils";

type AttendeeData = Record<string, string | number | boolean | null>;

type BuyOrderBody = {
  eventId: number;
  attendees: AttendeeData[];
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.emailVerified) {
      return NextResponse.json(
        {
          message: "Please verify your email first before purchasing tickets.",
        },
        { status: 403 },
      );
    }

    const userId = Number(session.user.id);
    const body: BuyOrderBody = await req.json();
    const { eventId, attendees } = body;

    if (!eventId || typeof eventId !== "number") {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    if (!Array.isArray(attendees) || attendees.length === 0) {
      return NextResponse.json(
        { message: "Attendee data is required" },
        { status: 400 },
      );
    }
    const normalizedAttendees = attendees.map((a) => ({
      ...a,
      email:
        typeof a.email === "string" ? a.email.trim().toLowerCase() : a.email,
    }));
    const { order, event, tickets } = await prisma.$transaction(
      async (tx) => {
        const event = await tx.event.findUnique({
          where: { id: eventId },
          include: { attendeeFields: { orderBy: { order: "asc" } } },
        });

        if (!event) {
          throw new OrderError("Event not found", 404);
        }
        if (event.externalUrl) {
          throw new OrderError(
            "Registration for this event is handled on the organizer's website.",
            400,
            { externalUrl: event.externalUrl },
          );
        }

        if (event.endDate && new Date(event.endDate) < new Date()) {
          throw new OrderError("This event has already ended", 400);
        }

        if (event.quota !== null) {
          const soldCount = await tx.ticket.count({
            where: { order: { eventId, status: { in: ["PAID", "PENDING"] } } },
          });

          const remaining = event.quota - soldCount;

          if (remaining <= 0) {
            throw new OrderError("Sorry, tickets are sold out", 409, {
              soldOut: true,
            });
          }

          if (normalizedAttendees.length > remaining) {
            throw new OrderError(`Only ${remaining} tickets remaining.`, 400);
          }
        }

        const emails = normalizedAttendees.map((a) => a.email);

        if (emails.some((e) => !e || typeof e !== "string")) {
          throw new OrderError("Each attendee must have an email", 400);
        }

        const existingTickets = await tx.ticket.findMany({
          where: {
            attendeeEmail: { in: emails as string[] },
            order: { eventId },
          },
          select: { attendeeEmail: true },
        });

        if (existingTickets.length > 0) {
          const registered = existingTickets
            .map((t) => t.attendeeEmail)
            .join(", ");
          throw new OrderError(`Email already registered: ${registered}`, 400, {
            alreadyRegistered: true,
          });
        }

        const totalAmount = event.price * normalizedAttendees.length;

        const newOrder = await tx.order.create({
          data: {
            eventId: event.id,
            userId,
            amount: totalAmount,
            currency: "IDR",
            status: event.price === 0 ? "PAID" : "PENDING",
            paidAt: event.price === 0 ? new Date() : null,
          },
        });
        const generatedTickets = [];
        for (const attendee of normalizedAttendees) {
          const result = await generateTicket({
            tx,
            order: newOrder,
            event,
            attendeeData: attendee,
          });
          generatedTickets.push(result);
        }

        return { order: newOrder, event, tickets: generatedTickets };
      },
      { isolationLevel: "Serializable" },
    );

    if (event.price === 0) {
      await Promise.allSettled(
        tickets
          .filter((t) => t !== null)
          .map((t) =>
            sendTicketEmail({
              to: t!.email,
              eventTitle: t!.eventTitle,
              qrCode: t!.code,

              attendeeName: t.ticket.attendeeName,
              bookingCode: t.ticket.code,

              date: formatDate(t.event.startDate),

              time: formatTime(
                t.event.startDate,
                t.event.endDate,
              ),
              venue: t.event.location ?? '',

              eventImage: t.event.coverImage ?? '',

              description: t.event.description,
              company: t.company,
              position: t.position,
            }),
          ),
      );

      return NextResponse.json({
        success: true,
        free: true,
        message: "Tickets successfully created for free event!",
      });
    }
    const invoice = await createXenditInvoice({
      orderId: order.id,
      amount: order.amount,
      description: `Event Ticket: ${event.title} (${tickets.length} attendee${tickets.length > 1 ? "s" : ""
        })`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        invoiceId: invoice.id,
        invoiceUrl: invoice.invoiceUrl,
      },
    });

    return NextResponse.json({
      success: true,
      invoiceUrl: invoice.invoiceUrl,
      message: "Invoice created. Please complete payment to activate tickets.",
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json(
        { message: error.message, ...error.extra },
        { status: error.status },
      );
    }

    console.error("[ORDER_BUY_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 },
    );
  }
}
