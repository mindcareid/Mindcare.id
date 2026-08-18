import { SendCompanyInviteEmailParams } from "../types";
import { emailLayout } from "./layout";

import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";

export function companyInviteTemplate({
  inviteeName,
  inviterName,
  companyName,
  role,
  acceptUrl,
}: SendCompanyInviteEmailParams) {
  return emailLayout({
    title: "Company Invitation",

    content: `
      ${Heading({
        children: "You're Invited!",
      })}

      ${Paragraph({
        children: `
          Hi <strong>${inviteeName}</strong>,
          <br /><br />

          <strong>${inviterName}</strong> has invited you to join
          <strong>${companyName}</strong> as
          <strong>${role}</strong>.
        `,
      })}

      ${Button({
        href: acceptUrl,
        children: "View Invitation",
      })}

      ${Paragraph({
        children:
          "You can accept or decline this invitation from your notification center.",
        size: 13,
        color: "#9CA3AF",
        marginTop: 18,
      })}

      ${Alert({
        variant: "info",
        children:
          "If you don't recognize this invitation, you can safely ignore this email.",
      })}
    `,
  });
}