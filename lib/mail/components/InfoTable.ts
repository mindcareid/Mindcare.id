type Row = {
  label: string;
  value: string;
};

type InfoTableProps = {
  rows: Row[];
};

export function InfoTable({
  rows,
}: InfoTableProps) {
  return `
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        margin-top:36px;
        border:1px solid #E5E7EB;
        border-radius:8px;
        overflow:hidden;
        border-collapse:collapse;
      "
    >
      ${rows
        .map(
          (row, index) => `
            <tr style="${
              index % 2 === 0 ? "background:#F8FAFC;" : ""
            }">

              <td
                style="
                  padding:14px 18px;
                  font-weight:600;
                  width:140px;
                  color:#111827;
                "
              >
                ${row.label}
              </td>

              <td
                style="
                  padding:14px 18px;
                  color:#374151;
                "
              >
                ${row.value}
              </td>

            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}