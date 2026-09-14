import ExcelJS from "exceljs";
import type { ParticipantReportRow } from "./type";

type FieldDef = { id: string; key: string; label: string };

type BuildParticipant = {
  rows: ParticipantReportRow[];
  fields: FieldDef[];
};

const Label: Record<ParticipantReportRow["status"], string> = {
  PAID: "PAID",
  PENDING: "PENDING",
  EXPIRED: "EXPIRED",
  CANCELED: "CANCELED",
  REFUNDED: "REFUNDED",
};

function shortOrderId(orderId: string, length = 8): string {
  return orderId.slice(-length).toUpperCase();
}

export async function participantWorkBook({
  rows,
  fields,
}: BuildParticipant): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Execorner";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Participant", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const baseColumns = [
    { header: "Order ID", key: "orderId", width: 14 },
    { header: "Buyer Name", key: "buyerName", width: 22 },
    { header: "Buyer Email", key: "buyerEmail", width: 26 },
    { header: "Buyer Phone Number", key: "buyerPhone", width: 18 },
    { header: "Transaction Date", key: "transactionDate", width: 20 },
    { header: "Total Participants", key: "quantity", width: 18 },
    { header: "Total Payment", key: "totalPayment", width: 18 },
    { header: "Status", key: "status", width: 20 },
    { header: "Participant Name", key: "attendeeName", width: 22 },
    { header: "Participant Email", key: "attendeeEmail", width: 26 },
    { header: "Participant Phone Number", key: "attendeePhone", width: 18 },
    { header: "Ticket Code", key: "ticketCode", width: 16 },
    // { header: "Checked In", key: "checkedIn", width: 12 },
  ];

  const dynamicColumns = fields.map((field) => ({
    header: field.label,
    key: `field_${field.key}`,
    width: 20,
  }));

  sheet.columns = [...baseColumns, ...dynamicColumns];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F2937" },
  };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = 22;

  for (const row of rows) {
    for (const attendee of row.attendees) {
      const dynamicValues: Record<string, string> = {};

      for (const field of fields) {
        const value = attendee.answers[field.key];
        dynamicValues[`field_${field.key}`] =
          value === null || value === undefined || value === ""
            ? "-"
            : typeof value === "boolean"
              ? value
                ? "Yes"
                : "No"
              : String(value);
      }

      const excelRow = sheet.addRow({
        orderId: shortOrderId(row.orderId),
        buyerName: row.buyer.name,
        buyerEmail: row.buyer.email,
        buyerPhone: row.buyer.phone ?? "-",
        transactionDate: row.transactionDate,
        quantity: row.quantity,
        totalPayment: row.totalPayment,
        status: Label[row.status],
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
        attendeePhone: attendee.phone ?? "-",
        ticketCode: attendee.code,
        // checkedIn: attendee.isCheckedIn ? "Ya" : "Tidak",
        ...dynamicValues,
      });

      excelRow.getCell("transactionDate").numFmt = "dd/mm/yyyy hh:mm";
      excelRow.getCell("totalPayment").numFmt = '"Rp" #,##0';
    }
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: baseColumns.length + dynamicColumns.length },
  };

  return workbook.xlsx.writeBuffer();
}
