type ButtonProps = {
  href: string;
  children: string;
};

export function Button({
  href,
  children,
}: ButtonProps) {
  return `
    <div
      style="
        margin-top:36px;
        text-align:center;
      "
    >

      <a
        href="${href}"
        style="
          display:inline-block;
          background:#2563EB;
          color:#FFFFFF;
          text-decoration:none;
          font-weight:600;
          font-size:15px;
          padding:14px 34px;
          border-radius:10px;
        "
      >
        ${children}
      </a>

    </div>
  `;
}