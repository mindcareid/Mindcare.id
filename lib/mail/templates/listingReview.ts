import {
  ListingKind,
  ListingReviewState,
  SendListingReviewEmailParams,
} from "../types";
import { emailLayout } from "./layout";
import { escapeHtml } from "../escape";

import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";
import { Spacer } from "../components/Spacer";
import { Text } from "../components/Text";

export const LISTING_KIND_LABEL: Record<ListingKind, string> = {
  professional: "Professional listing",
  "care-centre": "Care centre",
  solution: "Solution",
};

const HEADING: Record<ListingReviewState, string> = {
  under_review: "Application Under Review",
  approved: "Application Approved",
  rejected: "Application Update",
};

const TITLE: Record<ListingReviewState, string> = {
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Review Update",
};

function body({
  state,
  name,
  listingName,
  kind,
  reason,
}: SendListingReviewEmailParams) {
  const label = LISTING_KIND_LABEL[kind];
  const safeName = escapeHtml(name);
  const safeListing = escapeHtml(listingName);

  if (state === "under_review") {
    return `
      ${Paragraph({
        children: `
          Hi <strong style="color:#1e293b;">${safeName}</strong>,
          we have received your ${label.toLowerCase()}.
        `,
      })}

      ${Paragraph({
        children: `
          <strong style="color:#1e293b;">${safeListing}</strong>
          is now under review by our team. You do not need to do anything
          while you wait.
        `,
        marginTop: 8,
      })}

      ${Text({
        muted: true,
        children: `
          Reviews usually take
          <strong>1 to 3 business days</strong>.
          You will receive another email once a decision has been made.
        `,
      })}
    `;
  }

  if (state === "approved") {
    return `
      ${Paragraph({
        children: `
          Hi <strong style="color:#1e293b;">${safeName}</strong>,
          great news!
        `,
      })}

      ${Paragraph({
        children: `
          Your ${label.toLowerCase()}
          <strong style="color:#1e293b;">${safeListing}</strong>
          has been
          <strong style="color:#157768;">approved</strong>
          and is now visible in the directory.
        `,
        marginTop: 8,
      })}
    `;
  }

  return `
    ${Paragraph({
      children: `
        Hi <strong style="color:#1e293b;">${safeName}</strong>,
        thank you for your patience.
      `,
    })}

    ${Paragraph({
      children: `
        After reviewing your ${label.toLowerCase()},
        <strong style="color:#1e293b;">${safeListing}</strong>
        was
        <strong style="color:#DC2626;">not approved</strong>.
      `,
      marginTop: 8,
    })}

    ${
      reason
        ? Text({
            align: "left",
            children: `
              <strong style="color:#1e293b;">Reason:</strong>
              ${escapeHtml(reason)}
            `,
          })
        : ""
    }
  `;
}

export function listingReviewTemplate(data: SendListingReviewEmailParams) {
  const { state, kind, dashboardUrl, listingName } = data;
  const label = LISTING_KIND_LABEL[kind];

  const cta =
    state === "under_review"
      ? ""
      : Button({
          href: dashboardUrl ?? "#",
          children:
            state === "approved" ? "Open Dashboard" : "Review & Resubmit",
        });

  const alert =
    state === "under_review"
      ? Alert({
          variant: "info",
          children: `
            You will be notified by email as soon as your
            ${label.toLowerCase()} has been reviewed.
          `,
        })
      : state === "approved"
        ? Alert({
            variant: "success",
            children: `
              Your ${label.toLowerCase()} is live. You can start managing it
              right away from your dashboard.
            `,
          })
        : Alert({
            variant: "danger",
            children: `
              You can edit your ${label.toLowerCase()} in the dashboard and
              save it to send it back for review. Contact our support team if
              you believe this was a mistake.
            `,
          });

  return emailLayout({
    title: `${TITLE[state]} - ${escapeHtml(listingName)}`,

    content: [
      Heading({ children: HEADING[state] }),
      body(data),
      cta,
      Spacer(8),
      alert,
    ].join(""),
  });
}
