import { mailTheme } from "../theme";

type ButtonProps = {
  href: string;
  children: string;
};

export function Button({ href, children }: ButtonProps) {
  return `
    <div style="margin-top:32px; text-align:center;">
      <a
        href="${href}"
        style="
          display:inline-block;
          background:${mailTheme.primary};
          color:#FFFFFF;
          text-decoration:none;
          font-weight:700;
          font-size:15px;
          font-family:Arial,Helvetica,sans-serif;
          padding:14px 36px;
          border-radius:10px;
          letter-spacing:0.3px;
        "
      >
        ${children}
      </a>
    </div>
  `;
}