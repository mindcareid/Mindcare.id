import { EmailService } from "../service";
import { mailConfig } from "../config";
import { SendCompanyStatusEmailParams } from "../types";
import { companyApprovedTemplate } from "../templates/companyApproved";

export async function sendCompanyApprovedEmail(
  data: SendCompanyStatusEmailParams,
) {
  return EmailService.send({
    from: mailConfig.from,

    to: data.to,

    subject: `Your company "${data.companyName}" has been approved!`,

    html: companyApprovedTemplate(data),
  });
}