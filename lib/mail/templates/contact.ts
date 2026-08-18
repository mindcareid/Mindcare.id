import { SendContactNotificationParams } from "../types";
import { emailLayout } from "./layout";

import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";
import { InfoTable } from "../components/InfoTable";
import { MessageBox } from "../components/MessageBox";

export function contactTemplate({
  name,
  email,
  phoneNumber,
  subject,
  message,
}: SendContactNotificationParams) {
  return emailLayout({
    title: "New Contact Message",

    content: [
      Heading({
        children: "New Contact Message",
      }),

      Paragraph({
        children:
          "Someone submitted a message via the contact form.",
      }),

      InfoTable({
        rows: [
          {
            label: "Name",
            value: name,
          },
          {
            label: "Email",
            value: `
              <a
                href="mailto:${email}"
                style="
                  color:#2563EB;
                  text-decoration:none;
                "
              >
                ${email}
              </a>
            `,
          },
          {
            label: "Phone",
            value: phoneNumber ?? "-",
          },
          {
            label: "Subject",
            value: subject,
          },
        ],
      }),

      MessageBox({
        title: "Message",
        children: message,
      }),
    ].join(""),
  });
}