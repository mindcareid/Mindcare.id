import { mailConfig } from "../config";
import { SendTicketEmailParams } from "../types";
import { emailLayout } from "./layout";

import { Card } from "../components/Card";
import { Heading } from "../components/Heading";
import { Image } from "../components/Image";
import { Paragraph } from "../components/Paragraph";

export function ticketTemplate({
  eventTitle,
  qrCode,
}: SendTicketEmailParams) {
  const qrUrl = `${mailConfig.appUrl}/api/tickets/qr/${qrCode}`;

  return emailLayout({
    title: "Your Event Ticket",

    content: `
      ${Heading({
        children: "Your Event Ticket",
      })}

      ${Paragraph({
        children: "Thank you for registering for",
      })}

      ${Paragraph({
        children: `<strong>${eventTitle}</strong>`,
        color: "#111827",
        size: 22,
        marginTop: 10,
      })}

      ${Card({
        children: `
          ${Paragraph({
            children: "Present this QR Code at the check-in desk",
            color: "#374151",
            marginTop: 0,
          })}

          <div
            style="
              margin-top:24px;
              text-align:center;
            "
          >
            ${Image({
              src: qrUrl,
              alt: "Event QR Code",
              width: 220,
            })}
          </div>
        `,
      })}

      ${Paragraph({
        children:
          "Your official e-ticket is also attached as a PDF. You can present either the attached PDF or the QR code above during check-in.",
        size: 14,
        marginTop: 32,
      })}
    `,
  });
}