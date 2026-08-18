import { EmailService } from "../service";
import { mailConfig } from "../config";
import { verificationTemplate } from "../templates/verification";
import { SendVerificationEmailParams } from "../types";

export async function sendVerificationEmail(
  data: SendVerificationEmailParams,
) {
  return EmailService.send({
    from: mailConfig.from,

    to: data.to,

    subject: "Verify Your Email Address",

    html: verificationTemplate(data),
  });
}