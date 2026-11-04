import { escapeHtml } from "../escape";
import { mailTheme } from "../theme";
import { SendSponsorApplicationEmailParams } from "../types";
import { emailLayout } from "./layout";

import { Heading } from "../components/Heading";
import { InfoTable } from "../components/InfoTable";
import { Paragraph } from "../components/Paragraph";

// Format harga memakai satu sumber (`priceLines`), bukan salinan lokal.
// Salinan sebelumnya membuat PDF dan email bisa menampilkan angka berbeda
// untuk pengajuan yang sama.
import { priceLines } from "@/lib/sponsors/money";

export function sponsorApplicationTemplate({
  referenceNo,
  companyName,
  picName,
  eventTitle,
  eventDate,
  eventLocation,
  tierName,
  priceAmount,
  currency,
  displayUsd,
  benefits,
  supportEmail,
}: SendSponsorApplicationEmailParams) {
  const price = priceLines({ amount: priceAmount, currency, displayUsd });
  const priceLine = price.primary;

  const benefitsHtml =
    benefits.length > 0
      ? `
        ${Paragraph({
          children: "What this package includes",
          align: "left",
          color: mailTheme.text,
          size: 13,
          marginTop: 28,
        })}

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px; border:1px solid ${mailTheme.border}; border-radius:8px; border-collapse:separate; overflow:hidden;">
          ${benefits
            .map(
              (benefit, index) => `
            <tr style="${index % 2 === 0 ? `background:${mailTheme.light};` : ""}">
              <td style="padding:10px 14px; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:${mailTheme.text}; width:52%; border-bottom:1px solid ${mailTheme.border};">
                ${escapeHtml(benefit.title)}
              </td>
              <td style="padding:10px 14px; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:${mailTheme.textMuted}; border-bottom:1px solid ${mailTheme.border};">
                ${escapeHtml(benefit.detail ?? "—")}
              </td>
            </tr>
          `,
            )
            .join("")}
        </table>
      `
      : "";

  return emailLayout({
    title: `Sponsorship request received — ${referenceNo}`,

    content: `
      ${Heading({
        children: "Sponsorship request received",
      })}

      ${Paragraph({
        children: `Dear ${escapeHtml(picName)},`,
        align: "left",
        marginTop: 24,
      })}

      ${Paragraph({
        children: `Thank you for your interest in sponsoring <strong>${escapeHtml(
          eventTitle,
        )}</strong>. We have received the request from ${escapeHtml(
          companyName,
        )} and our sponsorship team will contact you shortly to arrange the invoice.`,
        align: "left",
      })}

      ${Paragraph({
        children: "Your reference number",
        align: "left",
        color: mailTheme.text,
        size: 13,
        marginTop: 28,
      })}

      <p
        style="
          margin:6px 0 0;
          font-family:Arial,Helvetica,sans-serif;
          font-size:26px;
          font-weight:700;
          letter-spacing:2px;
          color:${mailTheme.primary};
        "
      >
        ${escapeHtml(referenceNo)}
      </p>

      ${Paragraph({
        children:
          "Please quote this reference number in all correspondence with our team.",
        align: "left",
        size: 13,
        marginTop: 6,
      })}

      ${InfoTable({
        rows: [
          { label: "Package", value: escapeHtml(tierName) },
          { label: "Amount", value: escapeHtml(priceLine) },
          ...(price.secondary
            ? [
                {
                  label: "Indicative",
                  value: `${escapeHtml(
                    price.secondary,
                  )} — estimate only. The amount payable is ${escapeHtml(priceLine)}.`,
                },
              ]
            : []),
          { label: "Event", value: escapeHtml(eventTitle) },
          { label: "Date", value: escapeHtml(eventDate) },
          { label: "Location", value: escapeHtml(eventLocation) },
          { label: "Company", value: escapeHtml(companyName) },
        ],
      })}

      ${benefitsHtml}

      ${Paragraph({
        children:
          "A summary of this request is attached as a PDF for your records. <strong>It is not an invoice</strong> — no payment has been taken and no invoice has been issued yet.",
        align: "left",
        size: 13,
        marginTop: 28,
      })}

      ${Paragraph({
        children: `If anything in this request is incorrect, reply to this email or write to ${escapeHtml(
          supportEmail,
        )} quoting reference ${escapeHtml(referenceNo)}.`,
        align: "left",
        size: 13,
        marginTop: 12,
      })}

      ${Paragraph({
        children: "Kind regards,<br/>Sponsorship Team, Mindcare.Id",
        align: "left",
        color: mailTheme.text,
        size: 13,
        marginTop: 24,
      })}
    `,
  });
}
