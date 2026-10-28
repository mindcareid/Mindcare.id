import { mailTheme } from "../theme";
import { escapeHtml } from "../escape";

type EmailLayoutProps = {
  title?: string;
  content: string;
};

export function emailLayout({ title, content }: EmailLayoutProps) {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo/MindcareLogoLight.png`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title ?? "Mindcare")}</title>
</head>
<body style="
  margin:0;
  padding:0;
  background:${mailTheme.background};
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;
  -webkit-font-smoothing:antialiased;
">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  role="presentation"
  style="padding:24px 0;"
>
  <tr>
    <td align="center" style="padding:0 16px;">

      <!--[if mso]>
      <table role="presentation" width="${mailTheme.maxWidth}" cellpadding="0" cellspacing="0" align="center">
      <tr><td>
      <![endif]-->

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        role="presentation"
        style="
          max-width:${mailTheme.maxWidth}px;
          background:${mailTheme.white};
          border-radius:${mailTheme.radius};
          overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,0.06);
        "
      >

        <!-- ===== HEADER ===== -->
        <tr>
          <td
            align="center"
            bgcolor="${mailTheme.primary}"
            style="
              background:${mailTheme.primary};
              background:linear-gradient(135deg, ${mailTheme.primary}, ${mailTheme.primaryDark});
              padding:28px 32px;
              text-align:center;
            "
          >
            <img
              src="${logoUrl}"
              width="160"
              height="auto"
              alt="Mindcare"
              style="display:block;margin:0 auto;max-width:160px;height:auto;border:0;outline:none;"
            />
          </td>
        </tr>

        <!-- ===== AKSEN DIVIDER ===== -->
        <tr>
          <td style="
            background:${mailTheme.secondary};
            height:4px;
            line-height:4px;
            font-size:0;
          ">&nbsp;</td>
        </tr>

        <!-- ===== BODY ===== -->
        <tr>
          <td style="padding:36px 32px;">
            ${content}
          </td>
        </tr>

        <!-- ===== DIVIDER ===== -->
        <tr>
          <td style="padding:0 32px;">
            <hr style="
              margin:0;
              border:none;
              border-top:1px solid ${mailTheme.border};
            " />
          </td>
        </tr>

        <!-- ===== FOOTER ===== -->
        <tr>
          <td style="
            background:${mailTheme.light};
            padding:24px 32px;
            text-align:center;
            font-size:13px;
            font-family:Arial,Helvetica,sans-serif;
            color:${mailTheme.textMuted};
            line-height:22px;
          ">
            <p style="margin:0;font-weight:700;color:${mailTheme.primary};font-size:14px;letter-spacing:0.3px;">
              Mindcare
            </p>
            <p style="margin:8px 0 0;">
              This email was sent automatically.
              Please do not reply to this email.
            </p>
            <p style="margin:4px 0 0;">
              Need help?
              <a href="mailto:support@mindcare.id" style="
                color:${mailTheme.secondary};
                font-weight:700;
                text-decoration:underline;
              ">Contact support</a>
            </p>
            <p style="margin:12px 0 0;">
              &copy; ${new Date().getFullYear()} Mindcare. All rights reserved.
            </p>
          </td>
        </tr>

      </table>

      <!--[if mso]>
      </td></tr>
      </table>
      <![endif]-->

    </td>
  </tr>
</table>

</body>
</html>
`;
}
