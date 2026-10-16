import { EmailService } from "../service";
import { mailConfig } from "../config";
import { SendCompanyDecisionEmailParams } from "../types";
import { companyRejectedTemplate } from "../templates/companyRejected";

export async function sendCompanyRejectedEmail(
  data: SendCompanyDecisionEmailParams,
) {
  return EmailService.send({
    from: mailConfig.from,

    to: data.to,

    subject: `Update on your company "${data.companyName}"`,

    html: companyRejectedTemplate(data),
  });
}