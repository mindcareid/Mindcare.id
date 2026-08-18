type AlertVariant =
  | "success"
  | "warning"
  | "danger"
  | "info";

type AlertProps = {
  variant?: AlertVariant;
  children: string;
};

const variants = {
  success: {
    bg: "#F0FDF4",
    color: "#166534",
  },

  warning: {
    bg: "#FEF9C3",
    color: "#713F12",
  },

  danger: {
    bg: "#FEF2F2",
    color: "#991B1B",
  },

  info: {
    bg: "#EFF6FF",
    color: "#1D4ED8",
  },
};

export function Alert({
  variant = "info",
  children,
}: AlertProps) {
  const style = variants[variant];

  return `
    <div
      style="
        margin-top:36px;
        background:${style.bg};
        border-radius:10px;
        padding:18px;
      "
    >

      <p
        style="
          margin:0;
          color:${style.color};
          font-size:14px;
          line-height:24px;
        "
      >
        ${children}
      </p>

    </div>
  `;
}