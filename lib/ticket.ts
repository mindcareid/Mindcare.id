import QRCode from "qrcode";
import { Prisma, Event, Order } from "@prisma/client";

function generateHumanTicketCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let raw = "";

  for (let i = 0; i < 8; i++) {
    raw += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return raw.match(/.{1,4}/g)!.join("-");
}

type GenerateTicketParams = {
  tx: Prisma.TransactionClient;
  order: Order;
  event: Event;
  attendeeData: Record<string, string | number | boolean | null>;
};

export async function generateTicket({
  tx,
  order,
  event,
  attendeeData,
}: GenerateTicketParams) {
  const attendeeName = attendeeData.name || attendeeData.fullName || "";
  const attendeeEmail = attendeeData.email || "";
  const attendeePhone = attendeeData.phone || attendeeData.phoneNumber || null;

  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const ticketCode = generateHumanTicketCode();

    const qrPayload = JSON.stringify({
      ticketCode,
      orderId: order.id,
    });

    const qrCode = await QRCode.toDataURL(qrPayload);

    try {
      const ticket = await tx.ticket.create({
        data: {
          orderId: order.id,
          code: ticketCode,
          qrCode,
          attendeeName: String(attendeeName),
          attendeeEmail: String(attendeeEmail),
          attendeePhone: attendeePhone ? String(attendeePhone) : null,
          attendeeData,
        },
      });

      return {
        ticket,
        email: String(attendeeEmail),
        eventTitle: event.title,
        code: ticketCode,
        company: attendeeData.company
          ? String(attendeeData.company)
          : undefined,
        position: attendeeData.position
          ? String(attendeeData.position)
          : undefined,
        event: event,
      };
    } catch (error) {
      const isDuplicateCode =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";

      if (!isDuplicateCode || attempt === MAX_ATTEMPTS - 1) {
        throw error;
      }
    }
  }

  throw new Error("Failed to generate a unique ticket code");
}
