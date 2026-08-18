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
  color = "#64748B",
  size = 15,
  marginTop = 14,
}: ParagraphProps) {
  return `
    <p
      style="
        margin:${marginTop}px 0 0;
        color:${color};
        font-size:${size}px;
        line-height:24px;
        text-align:${align};
      "
    >
      ${children}
    </p>
  `;
}