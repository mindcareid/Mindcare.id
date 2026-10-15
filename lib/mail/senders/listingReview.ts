import { EmailService } from "../service";
import { mailConfig } from "../config";
import { SendListingReviewEmailParams } from "../types";
import {
  LISTING_KIND_LABEL,
  listingReviewTemplate,
} from "../templates/listingReview";

function buildSubject({
  state,
  kind,
  listingName,
}: SendListingReviewEmailParams) {
  const kindShort = LISTING_KIND_LABEL[kind];

  if (state === "under_review") {
    return `${kindShort} "${listingName}" is under review`;
  }

  if (state === "approved") {
    return `${kindShort} "${listingName}" has been approved`;
  }

  return `Update on your ${kindShort.toLowerCase()} "${listingName}"`;
}

export async function sendListingReviewEmail(
  data: SendListingReviewEmailParams,
) {
  return EmailService.send({
    from: mailConfig.from,

    to: data.to,

    subject: buildSubject(data),

    html: listingReviewTemplate(data),
  });
}
