import { SendCompanyStatusEmailParams } from "../types";
import { emailLayout } from "./layout";

import { Alert } from "../components/Alert";
import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";

export function companyRejectedTemplate({
  ownerName,
  companyName,
}: SendCompanyStatusEmailParams) {
  return emailLayout({
    title: "Company Review Update",

    content: `
      ${Heading({
        children: "Company Review Update",
      })}

      ${Paragraph({
        children: `
          Hi <strong>${ownerName}</strong>,
          <br /><br />

          Thank you for submitting
          <strong>${companyName}</strong>.

          After reviewing your submission, we're unable to approve your company at this time.
        `,
      })}

      ${Alert({
        variant: "danger",
        children: `
          Please contact our support team if you'd like more information about this decision
          or need assistance with submitting your company again.
        `,
      })}
    `,
  });
}