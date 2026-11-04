import { mailConfig } from "../config";
import { EmailService } from "../service";
import { sponsorApplicationTemplate } from "../templates/sponsor";
import { SendSponsorApplicationEmailParams } from "../types";

export async function sendSponsorApplicationEmail(
  data: SendSponsorApplicationEmailParams,
  pdf: Buffer,
  fileName: string,
) {
  return EmailService.send({
    from: mailConfig.from,
    to: data.to,
    replyTo: mailConfig.supportEmail,

    subject: `Sponsorship request received — ${data.referenceNo}`,

    html: sponsorApplicationTemplate(data),

    attachments: [
      {
        filename: fileName,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });
}
