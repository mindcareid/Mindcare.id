import { SendCompanyStatusEmailParams } from "../types";

import { emailLayout } from "./layout";

import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";

export function companyStatusTemplate({
  ownerName,
  companyName,
  dashboardUrl,
  status,
}: SendCompanyStatusEmailParams) {
  const approved = status === "approved";

  return emailLayout({
    title: approved
      ? "Company Approved"
      : "Company Review Update",

    content: `
      ${Heading({
        children: approved
          ? "Company Approved"
          : "Company Review Update",
      })}

      ${Paragraph({
        children: approved
          ? `
            Hi <strong>${ownerName}</strong>,
            <br><br>

            Great news! Your company
            <strong>${companyName}</strong>
            has been
            <strong style="color:#16A34A;">approved</strong>.

            <br><br>

            You can now start publishing events on Executive Corner.
          `
          : `
            Hi <strong>${ownerName}</strong>,
            <br><br>

            Unfortunately your company
            <strong>${companyName}</strong>
            was
            <strong style="color:#DC2626;">not approved</strong>
            during our review.

            <br><br>

            Please review your submission and contact our support team if you require further assistance.
          `,
      })}

      ${
        approved
          ? `
            ${Button({
              href: dashboardUrl ?? "#",
              children: "Go to Dashboard",
            })}

            ${Paragraph({
              children:
                "Please sign in again if your company dashboard is not yet visible.",
              size: 13,
              color: "#9CA3AF",
              marginTop: 18,
            })}
          `
          : ""
      }

      ${
        approved
          ? Alert({
              variant: "success",
              children:
                "Your company is now active and you can start creating events immediately.",
            })
          : Alert({
              variant: "danger",
              children:
                "If you believe this decision was made in error, please contact our support team for further assistance.",
            })
      }
    `,
  });
}