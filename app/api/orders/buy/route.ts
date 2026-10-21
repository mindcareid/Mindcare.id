import { NextResponse } from "next/server";
import { Prisma, type Event, type Order } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createXenditInvoice } from "@/lib/xendit";
import { generateTicket } from "@/lib/ticket";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendOrderTicketEmails } from "@/lib/orders/sendTicketEmails";
import { OrderError } from "@/lib/orders/OrderError";
import { rateLimit } from "@/lib/rateLimit";

type AttendeeData = Record<string, string | number | boolean | null>;

type BuyOrderBody = {
  eventId: number;
  attendees: AttendeeData[];
};

type OrderWithEvent = Order & { event: Event };

class ExistingInvoiceError extends Error {
  constructor(public invoiceUrl: string) {
    super("Existing pending order");
    this.name = "ExistingInvoiceError";
  }
}

const MAX_IDEMPOTENCY_KEY_LENGTH = 255;

function readIdempotencyKey(req: Request): string | null {
  const raw = req.headers.get("idempotency-key")?.trim();

  if (!raw || raw.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    return null;
  }

  return raw;
}

async function createInvoiceResponse({
  orderId,
  amount,
  eventTitle,
  idempotencyKey,
}: {
  orderId: string;
  amount: number;
  eventTitle: string;
  idempotencyKey: string | null;
}): Promise<NextResponse> {
  const ticketCount = await prisma.ticket.count({ where: { orderId } });

  const invoice = await createXenditInvoice({
    orderId,
    amount,
    description: `Event Ticket: ${eventTitle} (${ticketCount} attendee${
      ticketCount > 1 ? "s" : ""
    })`,
    idempotencyKey: idempotencyKey ?? undefined,
  });

  await prisma.order.update({
    where: { id: orderId },
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
}

async function replayExistingOrder(
  order: OrderWithEvent,
): Promise<NextResponse> {
  if (order.invoiceUrl) {
    return NextResponse.json({
      success: true,
      invoiceUrl: order.invoiceUrl,
      message:
        "Invoice already created. Please complete payment to activate tickets.",
    });
  }

  if (order.status === "PAID") {
    return NextResponse.json({
      success: true,
      free: true,
      message: "Tickets already created for this registration.",
    });
  }

  if (order.status === "PENDING") {
    return createInvoiceResponse({
      orderId: order.id,
      amount: order.amount,
      eventTitle: order.event.title,
      idempotencyKey: order.idempotencyKey,
    });
  }

  return NextResponse.json(
    {
      code: "IDEMPOTENCY_EXPIRED",
      message:
        "This registration attempt is no longer valid. Please start a new registration.",
    },
    { status: 409 },
  );
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

    if (userId && !session?.user.emailVerified) {
      return NextResponse.json(
        {
          message: "Please verify your email first before purchasing tickets.",
        },
        { status: 403 },
      );
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      "unknown";

    const buyLimit = userId
      ? rateLimit(`buy:${userId}`, 10, 60_000)
      : rateLimit(`buy-ip:${clientIp}`, 5, 60_000);

    if (!buyLimit.ok) {
      return NextResponse.json(
        { message: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(Math.ceil((buyLimit.resetAt - Date.now()) / 1000), 1),
            ),
          },
        },
      );
    }

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

    const maxTicketsConfig = Number(process.env.MAX_TICKETS_PER_ORDER ?? "10");
    const maxTicketsPerOrder =
      Number.isFinite(maxTicketsConfig) && maxTicketsConfig > 0
        ? maxTicketsConfig
        : 10;

    if (attendees.length > maxTicketsPerOrder) {
      return NextResponse.json(
        {
          message: `You can register up to ${maxTicketsPerOrder} attendees per order.`,
        },
        { status: 400 },
      );
    }

    const normalizedAttendees = attendees.map((a) => ({
      ...a,
      email:
        typeof a.email === "string" ? a.email.trim().toLowerCase() : a.email,
    }));

    const guestEmail = userId
      ? null
      : typeof normalizedAttendees[0]?.email === "string"
        ? normalizedAttendees[0].email
        : null;

    if (!userId && !guestEmail) {
      return NextResponse.json(
        { message: "An email is required to register as a guest" },
        { status: 400 },
      );
    }

    const idempotencyKey = readIdempotencyKey(req);

    if (idempotencyKey) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { event: true },
      });

      if (existing) {
        const sameOwner = userId
          ? existing.userId === userId
          : existing.userId === null && existing.guestEmail === guestEmail;

        if (!sameOwner) {
          return NextResponse.json(
            { message: "Invalid idempotency key" },
            { status: 409 },
          );
        }

        return replayExistingOrder(existing);
      }
    }

    // Guard per user + event: jangan biarkan satu user menumpuk order
    // PENDING untuk event yang sama. Pakai ulang invoice yang sudah ada.
    const existingPending = await prisma.order.findFirst({
      where: {
        ...(userId ? { userId } : { userId: null, guestEmail }),
        eventId,
        status: "PENDING",
        invoiceUrl: { not: null },
      },
      orderBy: { createdAt: "desc" },
      select: { invoiceUrl: true },
    });

    if (existingPending?.invoiceUrl) {
      return NextResponse.json({
        success: true,
        reused: true,
        invoiceUrl: existingPending.invoiceUrl,
        message:
          "You already have an unpaid invoice for this event. Complete it or wait for it to expire.",
      });
    }

    let created;

    try {
      created = await prisma.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM Event WHERE id = ${eventId} FOR UPDATE`;

          const event = await tx.event.findUnique({
            where: { id: eventId },
            include: { attendeeFields: { orderBy: { sortOrder: "asc" } } },
          });

          if (!event) {
            throw new OrderError("Event not found", 404);
          }

          if (!userId && event.price !== 0) {
            throw new OrderError(
              "Please sign in to register for this event.",
              401,
              { code: "LOGIN_REQUIRED" },
            );
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
          const existingPendingOrder = await tx.order.findFirst({
            where: {
              ...(userId ? { userId } : { userId: null, guestEmail }),
              eventId: event.id,
              status: "PENDING",
              invoiceUrl: { not: null },
            },
            orderBy: { createdAt: "desc" },
            select: { invoiceUrl: true },
          });

          if (existingPendingOrder?.invoiceUrl) {
            throw new ExistingInvoiceError(existingPendingOrder.invoiceUrl);
          }

          if (event.quota !== null) {
            const soldCount = await tx.ticket.count({
              where: {
                order: { eventId, status: { in: ["PAID", "PENDING"] } },
              },
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
              order: { eventId, status: { in: ["PAID", "PENDING"] } },
            },
            select: { attendeeEmail: true },
          });

          if (existingTickets.length > 0) {
            const registered = existingTickets
              .map((t) => t.attendeeEmail)
              .join(", ");
            throw new OrderError(
              `Email already registered: ${registered}`,
              400,
              {
                alreadyRegistered: true,
              },
            );
          }

          const totalAmount = event.price * normalizedAttendees.length;

          const newOrder = await tx.order.create({
            data: {
              eventId: event.id,
              userId,
              guestEmail,
              amount: totalAmount,
              currency: "IDR",
              status: event.price === 0 ? "PAID" : "PENDING",
              paidAt: event.price === 0 ? new Date() : null,
              idempotencyKey,
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

          return {
            order: newOrder,
            event,
            ticketCount: generatedTickets.length,
          };
        },
        { isolationLevel: "Serializable" },
      );
    } catch (error) {
      if (
        idempotencyKey &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await prisma.order.findUnique({
          where: { idempotencyKey },
          include: { event: true },
        });

        if (
          existing &&
          (userId
            ? existing.userId === userId
            : existing.userId === null && existing.guestEmail === guestEmail)
        ) {
          return replayExistingOrder(existing);
        }
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        return NextResponse.json(
          {
            code: "PROCESSING",
            message:
              "Your registration is being processed. Please retry in a moment.",
          },
          { status: 409 },
        );
      }

      throw error;
    }

    const { order, event, ticketCount } = created;

    if (event.price === 0) {
      await sendOrderTicketEmails(order.id);

      return NextResponse.json({
        success: true,
        free: true,
        message: `Tickets successfully created for free event! (${ticketCount})`,
      });
    }

    return createInvoiceResponse({
      orderId: order.id,
      amount: order.amount,
      eventTitle: event.title,
      idempotencyKey,
    });
  } catch (error) {
    if (error instanceof ExistingInvoiceError) {
      return NextResponse.json({
        success: true,
        reused: true,
        invoiceUrl: error.invoiceUrl,
        message:
          "You already have an unpaid invoice for this event. Complete it or wait for it to expire.",
      });
    }

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
