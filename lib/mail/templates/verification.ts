import { SendVerificationEmailParams } from "../types";
import { emailLayout } from "./layout";
import { escapeHtml } from "../escape";

import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";
import { Text } from "../components/Text";
import { Spacer } from "../components/Spacer";

export function verificationTemplate({
  name,
  verifyUrl,
}: SendVerificationEmailParams) {
  return emailLayout({
    title: "Verify Your Email - Mindcare",

    content: [
      Heading({
        children: "Verify Your Email",
      }),

      Paragraph({
        children: `
          Hi <strong style="color:#1e293b;">${escapeHtml(name)}</strong>,
          thanks for signing up!
        `,
      }),

      Paragraph({
        children:
          "Please verify your email address to activate your Mindcare account and start exploring our services.",
        marginTop: 8,
      }),

      Button({
        href: verifyUrl,
        children: "Verify Email Address",
      }),

      Text({
        muted: true,
        children: `
          This link will expire in
          <strong>24 hours</strong>.
          If you do not verify within that time, you can request a new verification email.
        `,
      }),

      Spacer(8),

      Alert({
        variant: "warning",
        children:
          "If you didn't create an account with Mindcare, you can safely ignore this email.",
      }),
    ].join(""),
  });
}