const smtpUser = process.env.SMTP_USER;
export const mailConfig = {
  appName: "Mindcare.Id",

  from: `"Mindcare.Id" <${smtpUser ?? "info@mindcare.id"}>`,
  appUrl: process.env.NEXT_PUBLIC_BASE_URL,

  supportEmail: smtpUser ?? "info@mindcare.id",

  contactRecipients: [
    smtpUser,
    process.env.CONTACT_FORWARDEMAIL,
    process.env.CONTACT_FORWARD,
  ].filter(Boolean) as string[],
};

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_HOST);
}
