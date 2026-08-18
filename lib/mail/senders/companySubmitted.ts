import { EmailService } from "../service";
import { mailConfig } from "../config";
import { SendCompanySubmittedEmailParams } from "../types";
import { companySubmittedTemplate } from "../templates/companySubmitted";

export async function sendCompanySubmittedEmail(
  data: SendCompanySubmittedEmailParams,
) {
  return EmailService.send({
    from: mailConfig.from,

    to: data.to,

    subject: `Your company "${data.companyName}" is under review`,

    html: companySubmittedTemplate(data),
  });
}