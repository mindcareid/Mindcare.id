import { EmailService } from "../service";
import { SendCompanyStatusEmailParams } from "../types";
import { companyStatusTemplate } from "../templates/companyStatus";

export async function sendCompanyStatusEmail(
  data: SendCompanyStatusEmailParams,
) {
  const subject =
    data.status === "approved"
      ? `Company Approved • ${data.companyName}`
      : `Company Review Update • ${data.companyName}`;

  return EmailService.send({
    to: data.to,

    subject,

    html: companyStatusTemplate(data),
  });
}