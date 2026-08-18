import { EmailService } from "../service";
import { mailConfig } from "../config";
import { SendCompanyInviteEmailParams } from "../types";
import { companyInviteTemplate } from "../templates/companyInvite";

export async function sendCompanyInviteEmail(
  data: SendCompanyInviteEmailParams,
) {
  return EmailService.send({
    from: mailConfig.from,

    to: data.to,

    subject: `You're invited to join ${data.companyName}`,

    html: companyInviteTemplate(data),
  });
}