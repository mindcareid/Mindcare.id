import { mailTheme } from "../theme";

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
  const textColor = muted ? mailTheme.textMuted : (color ?? mailTheme.textMuted);

  return `
    <p
      style="
        margin:${marginTop}px 0 0;
        color:${textColor};
        font-size:${size}px;
        font-family:Arial,Helvetica,sans-serif;
        font-weight:${weight};
        line-height:24px;
        text-align:${align};
      "
    >
      ${children}
    </p>
  `;
}