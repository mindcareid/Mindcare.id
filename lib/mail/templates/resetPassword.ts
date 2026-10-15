import { SendResetPasswordEmailParams } from "../types";
import { emailLayout } from "./layout";
import { escapeHtml } from "../escape";

import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";
import { Text } from "../components/Text";
import { Spacer } from "../components/Spacer";

export function resetPasswordTemplate({
  name,
  resetUrl,
}: SendResetPasswordEmailParams) {
  return emailLayout({
    title: "Reset Your Password - Mindcare",

    content: [
      Heading({
        children: "Reset Your Password",
      }),

      Paragraph({
        children: `
          Hi <strong style="color:#1e293b;">${escapeHtml(name)}</strong>,
          we received a request to reset your password.
        `,
      }),

      Paragraph({
        children:
          "Click the button below to create a new password for your Mindcare account.",
        marginTop: 8,
      }),

      Button({
        href: resetUrl,
        children: "Reset Password",
      }),

      Text({
        muted: true,
        children: `
          This link will expire in
          <strong>1 hour</strong>.
          If you do not use it within that time, you can request a new one.
        `,
      }),

      Spacer(8),

      Alert({
        variant: "warning",
        children:
          "If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.",
      }),
    ].join(""),
  });
}