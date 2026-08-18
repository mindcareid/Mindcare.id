import { SendCompanyStatusEmailParams } from "../types";
import { emailLayout } from "./layout";

import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";

export function companyApprovedTemplate({
  ownerName,
  companyName,
  dashboardUrl,
}: SendCompanyStatusEmailParams) {
  return emailLayout({
    title: "Company Approved",

    content: `
      ${Heading({
        children: "Your Company Has Been Approved 🎉",
      })}

      ${Paragraph({
        children: `
          Hi <strong>${ownerName}</strong>,
          <br /><br />

          Great news! Your company
          <strong>${companyName}</strong>
          has been <strong>approved</strong>.

          <br /><br />

          Your organization is now active and ready to start publishing events on Executive Corner.
        `,
      })}

      ${Button({
        href: dashboardUrl ?? "#",
        children: "Go to Dashboard",
      })}

      ${Paragraph({
        children:
          "If you don't see your company dashboard yet, please sign in again to refresh your account permissions.",
        size: 13,
        color: "#9CA3AF",
        marginTop: 18,
      })}

      ${Alert({
        variant: "success",
        children:
          "Your company is now active. You can start creating and publishing your first event immediately.",
      })}
    `,
  });
}