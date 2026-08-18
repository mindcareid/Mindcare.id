type InfoBoxProps = {
  children: string;
  align?: "left" | "center";
};

export function InfoBox({
  children,
  align = "center",
}: InfoBoxProps) {
  return `
    <div
      style="
        margin-top:36px;
        background:#F8FAFC;
        border-radius:10px;
        padding:22px;
        text-align:${align};
      "
    >
      ${children}
    </div>
  `;
}