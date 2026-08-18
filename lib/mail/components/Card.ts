type CardProps = {
  children: string;
};

export function Card({
  children,
}: CardProps) {
  return `
    <div
      style="
        margin-top:40px;
        border:1px dashed #D1D5DB;
        border-radius:12px;
        padding:32px;
      "
    >
      ${children}
    </div>
  `;
}