import { mailTheme } from "../theme";

type EmailLayoutProps = {
    title?: string;
    content: string;
};

export function emailLayout({
    title,
    content,
}: EmailLayoutProps) {
    const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/images/logo/logo-execorner.png`;

    return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8" />
<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
/>

<title>${title ?? "Executive Corner"}</title>
</head>

<body
style="
margin:0;
padding:0;
background:${mailTheme.background};
font-family:Arial,Helvetica,sans-serif;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="padding:40px 0;"
>

<tr>

<td align="center">

<table
width="${mailTheme.maxWidth}"
cellpadding="0"
cellspacing="0"
style="
background:#fff;
border-radius:${mailTheme.radius};
overflow:hidden;
box-shadow:0 8px 30px rgba(0,0,0,.05);
"
>

<!-- Header -->

<tr>

<td
align="center"
style="
background:${mailTheme.light};
padding:32px;
"
>

<img
src="${logoUrl}"
width="180"
alt="Executive Corner"
/>

</td>

</tr>

<!-- Body -->

<tr>

<td
style="
padding:40px;
"
>

${content}

</td>

</tr>

<!-- Footer -->

<tr>

<td
style="
background:#F8FAFC;
padding:24px;
text-align:center;
font-size:13px;
color:${mailTheme.secondary};
"
>

<p style="margin:0;font-weight:600;">
Executive Corner
</p>

<p style="margin-top:8px;">
This email was sent automatically.
Please do not reply to this email.
</p>

<p style="margin-top:8px;">
© ${new Date().getFullYear()} Executive Corner.
All rights reserved.
</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>

`;
}