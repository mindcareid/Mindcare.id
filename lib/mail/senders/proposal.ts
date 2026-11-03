import { mailConfig } from "../config";
import { EmailService } from "../service";
import { proposalTemplate } from "../templates/proposal";
import { SendProposalEmailParams } from "../types";

export async function sendProposalEmail(
  data: SendProposalEmailParams,
  file: Buffer,
) {
  return EmailService.send({
    from: mailConfig.from,
    to: data.to,
    replyTo: mailConfig.supportEmail,

    subject: `Your proposal for ${data.eventTitle}`,

    html: proposalTemplate(data),

    attachments: [
      {
        filename: data.fileName,
        content: file,
        contentType: "application/pdf",
      },
    ],
  });
}
