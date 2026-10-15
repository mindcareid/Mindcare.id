import { mailTheme } from "../theme";

type AlertVariant = "success" | "warning" | "danger" | "info";

type AlertProps = {
  variant?: AlertVariant;
  children: string;
};

const variants: Record<AlertVariant, { bg: string; color: string; border: string }> = {
  success: {
    bg: mailTheme.lightMint,
    color: mailTheme.accent,
    border: mailTheme.accent,
  },
  warning: {
    bg: "#FEF9C3",
    color: "#854D0E",
    border: "#EAB308",
  },
  danger: {
    bg: "#FEF2F2",
    color: "#991B1B",
    border: "#EF4444",
  },
  info: {
    bg: mailTheme.lightLavender,
    color: mailTheme.secondary,
    border: mailTheme.secondary,
  },
};

export function Alert({ variant = "info", children }: AlertProps) {
  const style = variants[variant];

  return `
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="margin-top:32px;"
    >
      <tr>
        <td
          style="
            background:${style.bg};
            border-radius:10px;
            padding:18px 20px;
            border-left:4px solid ${style.border};
          "
        >
          <p
            style="
              margin:0;
              color:${style.color};
              font-size:14px;
              font-family:Arial,Helvetica,sans-serif;
              line-height:24px;
            "
          >
            ${children}
          </p>
        </td>
      </tr>
    </table>
  `;
}