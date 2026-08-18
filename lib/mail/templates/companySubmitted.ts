import { SendCompanySubmittedEmailParams } from "../types";
import { emailLayout } from "./layout";

import { Alert } from "../components/Alert";
import { InfoBox } from "../components/InfoBox";
import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";

export function companySubmittedTemplate({
  ownerName,
  companyName,
}: SendCompanySubmittedEmailParams) {
  return emailLayout({
    title: "Company Submitted",

    content: `
      ${Heading({
        children: "Company Submitted",
      })}

      ${Paragraph({
        children: `
          Hi <strong>${ownerName}</strong>,
          <br /><br />
          Your company <strong>${companyName}</strong> has been submitted successfully
          and is currently under review by our team.
        `,
      })}

      ${InfoBox({
        align: "center",
        children: `
          ${Paragraph({
            children: `
              Our team will review your submission within
              <strong>1–3 business days</strong>.
              <br /><br />
              You'll receive another email once a decision has been made.
            `,
            marginTop: 0,
          })}
        `,
      })}

      ${Alert({
        variant: "warning",
        children:
          "If you didn't submit this company, please contact our support immediately.",
      })}
    `,
  });
}