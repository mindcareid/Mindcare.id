import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  // secure: true, aktifkan jika ingin tester email di mailtrap yg atas comment
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type SendTicketEmailParams = {
  to: string;
  eventTitle: string;
  qrCode: string; // base64 atau url
};
type SendContactNotificationParams = {
  name: string;
  email: string;
  phoneNumber?: string;
  subject: string;
  message: string;
};
type SendResetPasswordEmailParams = {
  to: string;
  name: string;
  resetUrl: string;
};
type SendVerificationEmailParams = {
  to: string;
  name: string;
  verifyUrl: string;
};

type SendCompanyInviteEmailParams = {
  to: string;
  inviteeName: string;
  inviterName: string;
  companyName: string;
  role: string;
  acceptUrl: string;
};

type SendCompanySubmittedEmailParams = {
  to: string;
  ownerName: string;
  companyName: string;
};

type SendCompanyStatusEmailParams = {
  to: string;
  ownerName: string;
  companyName: string;
  dashboardUrl?: string;
};

export async function sendTicketEmail({
  to,
  eventTitle,
  qrCode,
}: SendTicketEmailParams) {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo/logoNew.png`;
  const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets/qr/${qrCode}`;

  await transporter.sendMail({
    from: '"Executive Corner" <no-reply@executivecorner.id>',
    to,
    subject: `Your Ticket for ${eventTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Event Ticket</title>
</head>

<body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <!-- MAIN CARD -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.05);">

          <!-- HEADER -->
          <tr>
            <td align="center" style="padding:30px; background:#0f172a;">
              <img src="${logoUrl}" width="180" />
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td style="padding:32px 40px; text-align:center;">
              <h2 style="margin:0; color:#111827;">
                Your Event Ticket
              </h2>

              <p style="margin-top:12px; color:#6b7280;">
                Thank you for registering for
              </p>

              <p style="font-size:20px; font-weight:600; color:#111827;">
                ${eventTitle}
              </p>
            </td>
          </tr>

          <!-- QR SECTION -->
          <tr>
            <td align="center" style="padding:10px 40px 40px 40px;">
              
              <div style="border:1px dashed #d1d5db; border-radius:12px; padding:30px;">
                
                <p style="margin-bottom:20px; color:#374151;">
                  Present this QR Code at the check-in desk
                </p>

                <img src="${qrUrl}" width="220" alt="Event QR Code" />

              </div>

            </td>
          </tr>

          <!-- INFO -->
          <tr>
            <td style="padding:0 40px 40px 40px; text-align:center;">
              
              <p style="color:#6b7280; font-size:14px;">
                Please keep this email and show the QR Code when arriving at the event.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb; padding:24px; text-align:center; font-size:12px; color:#9ca3af;">
              
              <p style="margin:0;">
                This email was sent automatically by Executive Corner.
              </p>

              <p style="margin-top:6px;">
                Please do not reply to this email.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`,
  });
}

export async function sendContactNotification({
  name,
  email,
  phoneNumber,
  subject,
  message,
}: SendContactNotificationParams) {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo/logoNew.png`;
  const smtpuser = process.env.SMTP_USER;
  const recipient = process.env.CONTACT_FORWARDEMAIL;
  const forward = process.env.CONTACT_FORWARD;

  if (!smtpuser || !recipient || !forward) {
    throw new Error("Missing required email env variable");
  }

  console.log("📧 Sending email with config:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    from: smtpuser,
    to: [smtpuser, recipient, forward],
  });

  await transporter.sendMail({
    from: `"Executive Corner"<${process.env.SMTP_USER}>`,
    to: [smtpuser, recipient, forward],
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 0 !important; }
      .email-card { width: 100% !important; border-radius: 0 !important; }
      .email-header { padding: 20px !important; }
      .email-header img { width: 140px !important; }
      .email-title { padding: 24px 20px 16px 20px !important; }
      .email-info { padding: 0 20px 20px 20px !important; }
      .email-message { padding: 0 20px 24px 20px !important; }
      .email-footer { padding: 20px !important; }
      .info-table td { padding: 10px 12px !important; font-size: 13px !important; }
      .label-col { width: 80px !important; }
      h2 { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial, Helvetica, sans-serif;">

  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table class="email-card" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.05);">

          <!-- HEADER -->
          <tr>
            <td class="email-header" align="center" style="padding:30px; background:#0f172a;">
              <img src="${logoUrl}" width="180" alt="Executive Corner" style="display:block;" />
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td class="email-title" style="padding:32px 40px 16px 40px; text-align:center;">
              <h2 style="margin:0; color:#111827; font-size:22px;">New Contact Message</h2>
              <p style="margin-top:8px; color:#6b7280; font-size:14px; line-height:1.6;">
                Someone submitted a message via the contact form.
              </p>
            </td>
          </tr>

          <!-- CONTACT INFO -->
          <tr>
            <td class="email-info" style="padding:0 40px 24px 40px;">
              <table class="info-table" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">

                <tr style="background:#f9fafb;">
                  <td class="label-col" style="padding:12px 16px; font-weight:bold; color:#374151; width:120px; font-size:14px;">Name</td>
                  <td style="padding:12px 16px; color:#111827; font-size:14px;">${name}</td>
                </tr>

                <tr>
                  <td class="label-col" style="padding:12px 16px; font-weight:bold; color:#374151; font-size:14px;">Email</td>
                  <td style="padding:12px 16px; font-size:14px;">
                    <a href="mailto:${email}" style="color:#2563eb; text-decoration:none; word-break:break-all;">${email}</a>
                  </td>
                </tr>

                <tr style="background:#f9fafb;">
                  <td class="label-col" style="padding:12px 16px; font-weight:bold; color:#374151; font-size:14px;">Phone</td>
                  <td style="padding:12px 16px; color:#111827; font-size:14px;">${phoneNumber ?? "-"}</td>
                </tr>

                <tr>
                  <td class="label-col" style="padding:12px 16px; font-weight:bold; color:#374151; font-size:14px;">Subject</td>
                  <td style="padding:12px 16px; color:#111827; font-size:14px; word-break:break-word;">${subject}</td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- MESSAGE -->
          <tr>
            <td class="email-message" style="padding:0 40px 40px 40px;">
              <p style="margin:0 0 8px; font-weight:bold; color:#374151; font-size:14px;">Message:</p>
              <div style="background:#f1f5f9; border-radius:8px; padding:16px; color:#374151; font-size:14px; line-height:1.6; white-space:pre-line; word-break:break-word;">
                ${message}
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="email-footer" style="background:#f9fafb; padding:24px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb;">
              <p style="margin:0;">This email was sent automatically by Executive Corner.</p>
              <p style="margin-top:6px;">Please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`,
  });
}

export async function sendResetPasswordEmail({
  to,
  name,
  resetUrl,
}: SendResetPasswordEmailParams) {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo/logoNew.png`;
  await transporter.sendMail({
    from: `"Executive Corner"<${process.env.SMTP_USER}>`,
    to,
    subject: "Reset Your Password",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 0 !important; }
      .email-card { width: 100% !important; border-radius: 0 !important; }
      .email-header { padding: 20px !important; }
      .email-header img { width: 140px !important; }
      .email-body { padding: 24px 20px 16px 20px !important; }
      .email-info { padding: 0 20px 20px 20px !important; }
      .email-button { padding: 12px 24px !important; font-size: 14px !important; }
      .email-warning { padding: 0 20px 24px 20px !important; }
      .email-footer { padding: 20px !important; }
      h2 { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial, sans-serif;">

  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table class="email-card" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.05);">

          <!-- HEADER -->
          <tr>
            <td class="email-header" align="center" style="padding:30px; background:#0f172a;">
              <img src="${logoUrl}" width="180" alt="Executive Corner" style="display:block;" />
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td class="email-body" style="padding:32px 40px 16px 40px; text-align:center;">
              <h2 style="margin:0; color:#111827; font-size:22px;">Reset Your Password</h2>
              <p style="margin-top:8px; color:#6b7280; font-size:14px; line-height:1.6;">
                Hi <strong>${name}</strong>, we received a request to reset your password.
              </p>
            </td>
          </tr>

          <tr>
            <td class="email-info" align="center" style="padding:16px 40px 32px 40px;">
              <a
                href="${resetUrl}"
                class="email-button"
                style="display:inline-block; background:#2563eb; color:#ffffff; font-size:15px; font-weight:600; padding:14px 32px; border-radius:10px; text-decoration:none; mso-padding-alt:0;"
              >
                Reset Password
              </a>
              <p style="margin-top:16px; color:#9ca3af; font-size:12px;">
                This link will expire in <strong>1 hour</strong>.
              </p>
             
            </td>
          </tr>

          <!-- WARNING -->
          <tr>
            <td class="email-warning" style="padding:0 40px 32px 40px;">
              <div style="background:#fef9c3; border-radius:8px; padding:14px 16px;">
                <p style="margin:0; color:#713f12; font-size:13px; line-height:1.5;">
                  If you didn't request this, you can safely ignore this email.
                  Your password will not be changed.
                </p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="email-footer" style="background:#f9fafb; padding:24px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb;">
              <p style="margin:0;">This email was sent automatically by Executive Corner.</p>
              <p style="margin-top:6px;">Please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`,
  });
}

export async function sendVerificationEmail({
  to,
  name,
  verifyUrl,
}: SendVerificationEmailParams) {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo/logoNew.png`;
  await transporter.sendMail({
    from: `"Executive Corner" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify Your Email Address",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 0 !important; }
      .email-card { width: 100% !important; border-radius: 0 !important; }
      .email-header { padding: 20px !important; }
      .email-header img { width: 140px !important; }
      .email-body { padding: 24px 20px 16px 20px !important; }
      .email-info { padding: 0 20px 32px 20px !important; }
      .email-warning { padding: 0 20px 24px 20px !important; }
      .email-footer { padding: 20px !important; }
      h2 { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial, sans-serif;">

  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table class="email-card" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.05);">

          <!-- HEADER -->
          <tr>
            <td class="email-header" align="center" style="padding:30px; background:#0f172a;">
              <img src="${logoUrl}" width="180" alt="Executive Corner" style="display:block;" />
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td class="email-body" style="padding:32px 40px 16px 40px; text-align:center;">
              <h2 style="margin:0; color:#111827; font-size:22px;">Verify Your Email</h2>
              <p style="margin-top:8px; color:#6b7280; font-size:14px; line-height:1.6;">
                Hi <strong>${name}</strong>, thanks for signing up!
                Please verify your email address to get started.
              </p>
            </td>
          </tr>

          <!-- BUTTON -->
          <tr>
            <td class="email-info" align="center" style="padding:16px 40px 32px 40px;">
             <a 
                href="${verifyUrl}"
                style="display:inline-block; background:#2563eb; color:#ffffff; font-size:15px; font-weight:600; padding:14px 32px; border-radius:10px; text-decoration:none;"
              >
                Verify Email Address
              </a>
              <p style="margin-top:16px; color:#9ca3af; font-size:12px;">
                This link will expire in <strong>24 hours</strong>.
              </p>
              
            </td>
          </tr>

          <!-- WARNING -->
          <tr>
            <td class="email-warning" style="padding:0 40px 32px 40px;">
              <div style="background:#fef9c3; border-radius:8px; padding:14px 16px;">
                <p style="margin:0; color:#713f12; font-size:13px; line-height:1.5;">
                  If you didn't create an account, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="email-footer" style="background:#f9fafb; padding:24px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb;">
              <p style="margin:0;">This email was sent automatically by Executive Corner.</p>
              <p style="margin-top:6px;">Please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`,
  });
}

export async function sendCompanyInviteEmail({
  to,
  inviteeName,
  inviterName,
  companyName,
  role,
  acceptUrl,
}: SendCompanyInviteEmailParams) {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo/logoNew.png`;

  await transporter.sendMail({
    from: `"Executive Corner" <${process.env.SMTP_USER}>`,
    to,
    subject: `You're invited to join ${companyName}`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 0 !important; }
      .email-card { width: 100% !important; border-radius: 0 !important; }
      .email-header { padding: 20px !important; }
      .email-header img { width: 140px !important; }
      .email-body { padding: 24px 20px 16px 20px !important; }
      .email-info { padding: 0 20px 32px 20px !important; }
      .email-warning { padding: 0 20px 24px 20px !important; }
      .email-footer { padding: 20px !important; }
      h2 { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial, sans-serif;">

  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table class="email-card" width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.05);">

          <!-- HEADER -->
          <tr>
            <td class="email-header" align="center" style="padding:30px; background:#0f172a;">
              <img src="${logoUrl}" width="180" alt="Executive Corner" style="display:block;" />
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="email-body" style="padding:32px 40px 16px 40px; text-align:center;">
              <h2 style="margin:0; color:#111827; font-size:22px;">You're Invited!</h2>
              <p style="margin-top:12px; color:#6b7280; font-size:14px; line-height:1.7;">
                Hi <strong>${inviteeName}</strong>,<br />
                <strong>${inviterName}</strong> has invited you to join
                <strong>${companyName}</strong> as a <strong>${role}</strong>.
              </p>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td class="email-info" align="center" style="padding:16px 40px 32px 40px;">
              <a
                href="${acceptUrl}"
                style="display:inline-block; background:#2563eb; color:#ffffff;
                       font-size:15px; font-weight:600; padding:14px 32px;
                       border-radius:10px; text-decoration:none;"
              >
                View Invitation
              </a>
              <p style="margin-top:16px; color:#9ca3af; font-size:12px;">
                You can accept or decline from your notification center.
              </p>
            </td>
          </tr>

          <!-- WARNING -->
          <tr>
            <td class="email-warning" style="padding:0 40px 32px 40px;">
              <div style="background:#f0f9ff; border-radius:8px; padding:14px 16px;">
                <p style="margin:0; color:#075985; font-size:13px; line-height:1.5;">
                  If you don't recognize this invitation, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="email-footer" style="background:#f9fafb; padding:24px; text-align:center;
                       font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb;">
              <p style="margin:0;">This email was sent automatically by Executive Corner.</p>
              <p style="margin-top:6px;">Please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`,
  });
}

export async function sendCompanySubmittedEmail({
  to,
  ownerName,
  companyName,
}: SendCompanySubmittedEmailParams) {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo/logoNew.png`;

  await transporter.sendMail({
    from: `"Executive Corner" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your company "${companyName}" is under review`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 0 !important; }
      .email-card { width: 100% !important; border-radius: 0 !important; }
      .email-header { padding: 20px !important; }
      .email-header img { width: 140px !important; }
      .email-body { padding: 24px 20px 16px 20px !important; }
      .email-info { padding: 0 20px 32px 20px !important; }
      .email-warning { padding: 0 20px 24px 20px !important; }
      .email-footer { padding: 20px !important; }
      h2 { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial, sans-serif;">
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table class="email-card" width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.05);">

          <tr>
            <td class="email-header" align="center" style="padding:30px; background:#0f172a;">
              <img src="${logoUrl}" width="180" alt="Executive Corner" style="display:block;" />
            </td>
          </tr>

          <tr>
            <td class="email-body" style="padding:32px 40px 16px 40px; text-align:center;">
              <h2 style="margin:0; color:#111827; font-size:22px;">Company Submitted!</h2>
              <p style="margin-top:12px; color:#6b7280; font-size:14px; line-height:1.7;">
                Hi <strong style="color:#111827;">${ownerName}</strong>,<br />
                your company <strong style="color:#111827;">${companyName}</strong> has been
                submitted and is currently under review by our team.
              </p>
            </td>
          </tr>

          <!-- INFO BOX -->
          <tr>
            <td class="email-info" style="padding:16px 40px 32px 40px;">
              <div style="background:#f8fafc; border-radius:10px; padding:20px; text-align:center;">
                <p style="margin:0; color:#374151; font-size:14px; line-height:1.8;">
                   Our team will review your submission within <strong>1–3 business days</strong>.<br />
                  You will receive an email once a decision has been made.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td class="email-warning" style="padding:0 40px 32px 40px;">
              <div style="background:#fef9c3; border-radius:8px; padding:14px 16px;">
                <p style="margin:0; color:#713f12; font-size:13px; line-height:1.5;">
                  If you didn't submit this company, please contact our support immediately.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td class="email-footer" style="background:#f9fafb; padding:24px; text-align:center;
                       font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb;">
              <p style="margin:0;">This email was sent automatically by Executive Corner.</p>
              <p style="margin-top:6px;">Please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

export async function sendCompanyApprovedEmail({
  to,
  ownerName,
  companyName,
  dashboardUrl,
}: SendCompanyStatusEmailParams) {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo/logoNew.png`;

  await transporter.sendMail({
    from: `"Executive Corner" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your company "${companyName}" has been approved! `,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 0 !important; }
      .email-card { width: 100% !important; border-radius: 0 !important; }
      .email-header { padding: 20px !important; }
      .email-header img { width: 140px !important; }
      .email-body { padding: 24px 20px 16px 20px !important; }
      .email-info { padding: 0 20px 32px 20px !important; }
      .email-warning { padding: 0 20px 24px 20px !important; }
      .email-footer { padding: 20px !important; }
      h2 { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial, sans-serif;">
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table class="email-card" width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.05);">

          <tr>
            <td class="email-header" align="center" style="padding:30px; background:#0f172a;">
              <img src="${logoUrl}" width="180" alt="Executive Corner" style="display:block;" />
            </td>
          </tr>

          <tr>
            <td class="email-body" style="padding:32px 40px 16px 40px; text-align:center;">
              <h2 style="margin:0; color:#111827; font-size:22px;">You're Approved! 🚀</h2>
              <p style="margin-top:12px; color:#6b7280; font-size:14px; line-height:1.7;">
                Hi <strong style="color:#111827;">${ownerName}</strong>,<br />
                great news! Your company <strong style="color:#111827;">${companyName}</strong>
                has been <strong style="color:#16a34a;">approved</strong>.
                You can now start publishing events.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td class="email-info" align="center" style="padding:16px 40px 32px 40px;">
              <a
                href="${dashboardUrl}"
                style="display:inline-block; background:#2563eb; color:#ffffff;
                       font-size:15px; font-weight:600; padding:14px 32px;
                       border-radius:10px; text-decoration:none;"
              >
                Go to Dashboard →
              </a>
              <p style="margin-top:14px; color:#9ca3af; font-size:12px;">
                Please re-login if you don't see your dashboard yet.
              </p>
            </td>
          </tr>

          <tr>
            <td class="email-warning" style="padding:0 40px 32px 40px;">
              <div style="background:#f0fdf4; border-radius:8px; padding:14px 16px;">
                <p style="margin:0; color:#166534; font-size:13px; line-height:1.5;">
                  ✅ Your company is now active. Start creating your first event from the dashboard.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td class="email-footer" style="background:#f9fafb; padding:24px; text-align:center;
                       font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb;">
              <p style="margin:0;">This email was sent automatically by Executive Corner.</p>
              <p style="margin-top:6px;">Please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

export async function sendCompanyRejectedEmail({
  to,
  ownerName,
  companyName,
}: SendCompanyStatusEmailParams) {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo/logoNew.png`;

  await transporter.sendMail({
    from: `"Executive Corner" <${process.env.SMTP_USER}>`,
    to,
    subject: `Update on your company "${companyName}"`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 0 !important; }
      .email-card { width: 100% !important; border-radius: 0 !important; }
      .email-header { padding: 20px !important; }
      .email-header img { width: 140px !important; }
      .email-body { padding: 24px 20px 16px 20px !important; }
      .email-info { padding: 0 20px 32px 20px !important; }
      .email-warning { padding: 0 20px 24px 20px !important; }
      .email-footer { padding: 20px !important; }
      h2 { font-size: 18px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial, sans-serif;">
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table class="email-card" width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.05);">

          <tr>
            <td class="email-header" align="center" style="padding:30px; background:#0f172a;">
              <img src="${logoUrl}" width="180" alt="Executive Corner" style="display:block;" />
            </td>
          </tr>

          <tr>
            <td class="email-body" style="padding:32px 40px 16px 40px; text-align:center;">
              <h2 style="margin:0; color:#111827; font-size:22px;">Company Not Approved</h2>
              <p style="margin-top:12px; color:#6b7280; font-size:14px; line-height:1.7;">
                Hi <strong style="color:#111827;">${ownerName}</strong>,<br />
                unfortunately your company <strong style="color:#111827;">${companyName}</strong>
                was <strong style="color:#dc2626;">not approved</strong> at this time.
              </p>
            </td>
          </tr>

          <tr>
            <td class="email-warning" style="padding:0 40px 32px 40px;">
              <div style="background:#fef2f2; border-radius:8px; padding:14px 16px;">
                <p style="margin:0; color:#991b1b; font-size:13px; line-height:1.5;">
                  Please contact our support team for more information regarding this decision.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td class="email-footer" style="background:#f9fafb; padding:24px; text-align:center;
                       font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb;">
              <p style="margin:0;">This email was sent automatically by Executive Corner.</p>
              <p style="margin-top:6px;">Please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
