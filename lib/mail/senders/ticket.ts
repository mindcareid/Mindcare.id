import { PdfService } from "@/lib/pdf";

import { mailConfig } from "../config";
import { EmailService } from "../service";
import { ticketTemplate } from "../templates/ticket";
import { SendTicketEmailParams } from "../types";

export async function sendTicketEmail(
  data: SendTicketEmailParams,
) {
  const attachment = await PdfService.generateTicket({
    eventTitle: data.eventTitle,
    eventImage: data.eventImage,

    qrCode: data.qrCode,
    bookingCode: data.bookingCode,

    attendeeName: data.attendeeName,
    email: data.to,

    company: data.company,
    position: data.position,

    date: data.date,
    time: data.time,
    venue: data.venue,

    description: data.description,
  });

  return EmailService.send({
    from: mailConfig.from,

    to: data.to,

    subject: `Your Ticket for ${data.eventTitle}`,

    html: ticketTemplate(data),

    attachments: [
      {
        filename: `${data.bookingCode}.pdf`,
        content: attachment,
        contentType: "application/pdf",
      },
    ],
  });
}