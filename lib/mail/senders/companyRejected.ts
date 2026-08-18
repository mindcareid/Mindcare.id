import { EmailService } from "../service";
import { mailConfig } from "../config";
import { SendCompanyStatusEmailParams } from "../types";
import { companyRejectedTemplate } from "../templates/companyRejected";

export async function sendCompanyRejectedEmail(
  data: SendCompanyStatusEmailParams,
) {
  return EmailService.send({
    from: mailConfig.from,

    to: data.to,

    subject: `Update on your company "${data.companyName}"`,

    html: companyRejectedTemplate(data),
  });
}