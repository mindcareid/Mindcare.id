import { EmailService } from "../service";
import { mailConfig } from "../config";
import { SendCompanyDecisionEmailParams } from "../types";
import { companyApprovedTemplate } from "../templates/companyApproved";

export async function sendCompanyApprovedEmail(
  data: SendCompanyDecisionEmailParams,
) {
  return EmailService.send({
    from: mailConfig.from,

    to: data.to,

    subject: `Your company "${data.companyName}" has been approved!`,

    html: companyApprovedTemplate(data),
  });
}