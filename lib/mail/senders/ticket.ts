import { PdfService } from "@/lib/pdf";

import { mailConfig } from "../config";
import { EmailService } from "../service";
import { CID_QR_CONTENT_ID, ticketTemplate } from "../templates/ticket";
import { SendTicketEmailParams } from "../types";

function qrDataUrlToBuffer(dataUrl: string): Buffer | null {
  const base64Data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;

  if (!base64Data) return null;

  return Buffer.from(base64Data, "base64");
}

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

  const qrBuffer = data.qrCodeDataUrl
    ? qrDataUrlToBuffer(data.qrCodeDataUrl)
    : null;

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
      ...(qrBuffer
        ? [
            {
              filename: "ticket-qr.png",
              content: qrBuffer,
              contentType: "image/png",
              cid: CID_QR_CONTENT_ID,
              contentDisposition: "inline" as const,
            },
          ]
        : []),
    ],
  });
}
