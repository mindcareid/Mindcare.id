import type { ParticipantOrder, ParticipantReportRow } from "./type";

export function mapOrderToParticipantRow(
  order: ParticipantOrder,
): ParticipantReportRow {
  return {
    orderId: order.id,
    buyer: {
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phonenumber,
    },
    transactionDate: order.createdAt,
    isFree: order.amount === 0,
    quantity: order.ticket.length,
    totalPayment: order.amount,
    status: order.status,
    attendees: order.ticket.map((t) => ({
      ticketId: t.id,
      name: t.attendeeName,
      email: t.attendeeEmail,
      phone: t.attendeePhone,
      code: t.code,
      isCheckedIn: t.isCheckedIn,
      answers:
        typeof t.attendeeData === "object" && t.attendeeData !== null
          ? (t.attendeeData as Record<string, unknown>)
          : {},
    })),
  };
}
