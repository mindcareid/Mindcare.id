const smtpUser = process.env.SMTP_USER;

if (!smtpUser) {
  throw new Error("SMTP_USER environment variable is required.");
}

export const mailConfig = {
  appName: "Executive Corner",

  from: `"Executive Corner" <${smtpUser}>`,
  appUrl: process.env.NEXT_PUBLIC_BASE_URL,

  supportEmail: smtpUser,

  contactRecipients: [
    smtpUser,
    process.env.CONTACT_FORWARDEMAIL,
    process.env.CONTACT_FORWARD,
  ].filter(Boolean) as string[],
};