import { EmailService } from "../service";
import { mailConfig } from "../config";
import { contactTemplate } from "../templates/contact";
import { SendContactNotificationParams } from "../types";

export async function sendContactNotification(
  data: SendContactNotificationParams,
) {
  return EmailService.send({
    from: mailConfig.from,
    to: mailConfig.contactRecipients,
    replyTo: data.email,
    subject: `[Contact] ${data.subject}`,
    html: contactTemplate(data),
  });
}