import { escapeHtml } from "../escape";
import { SendProposalEmailParams } from "../types";
import { emailLayout } from "./layout";

import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InfoTable } from "../components/InfoTable";
import { Paragraph } from "../components/Paragraph";

export function proposalTemplate({
  fullName,
  eventTitle,
  date,
  time,
  location,
  eventUrl,
}: SendProposalEmailParams) {
  return emailLayout({
    title: `Your event proposal — ${eventTitle}`,

    content: [
      Heading({
        children: "Thank you for your interest",
      }),

      Paragraph({
        children: `Hi ${escapeHtml(fullName)},`,
      }),

      Paragraph({
        children:
          "Thank you for downloading our event proposal. The complete proposal is attached to this email as a PDF.",
      }),

      Paragraph({
        children: `<strong>${escapeHtml(eventTitle)}</strong>`,
        color: "#0B2440",
        size: 20,
        marginTop: 10,
      }),

      InfoTable({
        rows: [
          { label: "Date", value: escapeHtml(date) },
          { label: "Time", value: escapeHtml(time) },
          { label: "Location", value: escapeHtml(location) },
        ],
      }),

      Paragraph({
        children:
          "If you have any questions about this proposal or would like to discuss further, simply reply to this email — we would be glad to help.",
        size: 14,
        marginTop: 30,
      }),

      eventUrl
        ? Paragraph({
            children: "You can revisit the event page anytime with the button below.",
            size: 14,
            marginTop: 24,
          })
        : "",

      eventUrl ? Button({ href: eventUrl, children: "Open event page" }) : "",
    ].join(""),
  });
}
