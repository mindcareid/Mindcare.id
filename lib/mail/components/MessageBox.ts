type MessageBoxProps = {
  title?: string;
  children: string;
};

export function MessageBox({
  title = "Message",
  children,
}: MessageBoxProps) {
  return `
    <div style="margin-top:32px;">

      <p
        style="
          margin:0 0 12px;
          color:#111827;
          font-size:15px;
          font-weight:600;
        "
      >
        ${title}
      </p>

      <div
        style="
          background:#F1F5F9;
          padding:18px;
          border-radius:8px;
          color:#374151;
          line-height:24px;
          white-space:pre-line;
        "
      >
        ${children}
      </div>

    </div>
  `;
}