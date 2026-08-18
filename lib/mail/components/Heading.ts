type HeadingProps = {
  children: string;
};

export function Heading({
  children,
}: HeadingProps) {
  return `
    <h2
      style="
        margin:0;
        color:#111827;
        font-size:28px;
        font-weight:700;
        text-align:center;
      "
    >
      ${children}
    </h2>
  `;
}