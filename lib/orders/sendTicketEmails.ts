import { prisma } from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/mail";
import { mailConfig } from "@/lib/mail/config";
import { createTicketToken } from "@/lib/tickets/token";
import { formatDate, formatTimeOnly } from "@/lib/utils/FormatDate";

/**
 * Ticket emails are paused: tickets are still created and stay reachable from
 * "/tickets/<token>" and the dashboard, but nothing is sent. Set
 * TICKET_EMAILS_ENABLED=true in the environment to resume delivery.
 */
function ticketEmailsEnabled(): boolean {
  return process.env.TICKET_EMAILS_ENABLED === "true";
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
export async function sendOrderTicketEmails(orderId: string): Promise<void> {
  if (!ticketEmailsEnabled()) {
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { tickets: true, event: true },
  });

  if (!order || order.event.externalUrl || order.tickets.length === 0) {
    return;
  }

  const timeZone = order.event.timeZone || "Asia/Jakarta";

  await Promise.allSettled(
    order.tickets.map((t) => {
      const data = (t.attendeeData ?? {}) as Record<string, unknown>;

      const ticketUrl = mailConfig.appUrl
        ? `${mailConfig.appUrl}/tickets/${createTicketToken(t.id)}`
        : undefined;

      return sendTicketEmail({
        to: t.attendeeEmail,
        eventTitle: order.event.title,
        qrCode: t.code,
        qrCodeDataUrl: t.qrCode ?? undefined,

        attendeeName: t.attendeeName,
        bookingCode: t.code,

        date: formatDate(order.event.startDate, timeZone),
        time: `${formatTimeOnly(order.event.startDate, timeZone)} - ${formatTimeOnly(order.event.endDate, timeZone)}`,
        venue: order.event.location ?? "",

        eventImage: order.event.coverImage ?? "",
        description: order.event.description,

        company: asString(data.company),
        position: asString(data.position),

        ticketUrl,
      });
    }),
  );
}
