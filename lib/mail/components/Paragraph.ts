import { mailTheme } from "../theme";

type ParagraphProps = {
  children: string;
  align?: "left" | "center";
  color?: string;
  size?: number;
  marginTop?: number;
};

export function Paragraph({
  children,
  align = "center",
  color = mailTheme.textMuted,
  size = 15,
  marginTop = 14,
}: ParagraphProps) {
  return `
    <p
      style="
        margin:${marginTop}px 0 0;
        color:${color};
        font-size:${size}px;
        font-family:Arial,Helvetica,sans-serif;
        line-height:26px;
        text-align:${align};
      "
    >
      ${children}
    </p>
  `;
}