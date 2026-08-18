import { EmailService } from "../service";
import { mailConfig } from "../config";
import { SendResetPasswordEmailParams } from "../types";
import { resetPasswordTemplate } from "../templates/resetPassword";

export async function sendResetPasswordEmail(
  data: SendResetPasswordEmailParams,
) {
  return EmailService.send({
    from: mailConfig.from,

    to: data.to,

    subject: "Reset Your Password",

    html: resetPasswordTemplate(data),
  });
}