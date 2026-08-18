type TextProps = {
  children: string;
  align?: "left" | "center" | "right";
  color?: string;
  size?: number;
  weight?: number;
  marginTop?: number;
  muted?: boolean;
};

export function Text({
  children,
  align = "center",
  color,
  size = 13,
  weight = 400,
  marginTop = 18,
  muted = false,
}: TextProps) {
  const textColor = muted ? "#9CA3AF" : (color ?? "#64748B");

  return `
    <p
      style="
        margin:${marginTop}px 0 0;
        color:${textColor};
        font-size:${size}px;
        font-weight:${weight};
        line-height:22px;
        text-align:${align};
      "
    >
      ${children}
    </p>
  `;
}