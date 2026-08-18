import { SendResetPasswordEmailParams } from "../types";
import { emailLayout } from "./layout";

import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";
import { Text } from "../components/Text";

export function resetPasswordTemplate({
  name,
  resetUrl,
}: SendResetPasswordEmailParams) {
  return emailLayout({
    title: "Reset Your Password",

    content: [
      Heading({
        children: "Reset Your Password",
      }),

      Paragraph({
        children: `
          Hi <strong>${name}</strong>, we received a request to reset your password.
        `,
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
        `,
      }),

      Alert({
        variant: "warning",
        children: `
          If you didn't request this password reset, you can safely ignore this email.
          Your password will remain unchanged.
        `,
      }),
    ].join(""),
  });
}