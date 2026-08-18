import { SendVerificationEmailParams } from "../types";
import { emailLayout } from "./layout";

import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";
import { Text } from "../components/Text";

export function verificationTemplate({
  name,
  verifyUrl,
}: SendVerificationEmailParams) {
  return emailLayout({
    title: "Verify Your Email",

    content: `
      ${Heading({
        children: "Verify Your Email",
      })}

      ${Paragraph({
        children: `
          Hi <strong>${name}</strong>, thanks for signing up!
          <br />
          Please verify your email address to get started.
        `,
      })}

      ${Button({
        href: verifyUrl,
        children: "Verify Email Address",
      })}

      ${Text({
        muted: true,
        children: `
          This link will expire in
          <strong>24 hours</strong>.
        `,
      })}

      ${Alert({
        variant: "warning",
        children:
          "If you didn't create an account, you can safely ignore this email.",
      })}
    `,
  });
}