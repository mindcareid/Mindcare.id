import ExcelJS from "exceljs";

import { getAdminUser } from "@/lib/adminGuard";
import {
  MAX_EXPORT_ROWS,
  parseFilters,
} from "@/lib/cadmin/proposalDownloads.shared";
import {
  iterateDownloads,
  loadDownloads,
  type DownloadRow,
} from "@/lib/cadmin/proposalDownloads";
const COLORS = {
  navy: "FF154375",
  purple: "FF63509E",
  emerald: "FF157768",
  border: "FFD6DCE5",
  zebra: "FFF4F6F9",
  white: "FFFFFFFF",
} as const;

const COLUMNS = [
  { header: "No", width: 6 },
  { header: "Nama Event", width: 34 },
  { header: "Event Name (form)", width: 34 },
  { header: "Nama Lengkap", width: 26 },
  { header: "Email", width: 32 },
  { header: "Telepon", width: 18 },
  { header: "Institusi", width: 28 },
  { header: "Jabatan", width: 24 },
  { header: "Sumber File", width: 14 },
  { header: "Status", width: 12 },
  { header: "Proposal Terkirim", width: 20 },
  { header: "Waktu Request", width: 20 },
] as const;

const STATUS_LABEL = {
  CONFIRMED: "Terkirim",
  PENDING: "Diproses",
  FAILED: "Gagal",
} as const;

function formatDateTimeId(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function fillBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "hair", color: { argb: COLORS.border } },
    bottom: { style: "hair", color: { argb: COLORS.border } },
    left: { style: "hair", color: { argb: COLORS.border } },
    right: { style: "hair", color: { argb: COLORS.border } },
  };
}

/**
 * GET /api/cadmin/proposal-downloads/export-xlsx
 *
 * Satu sheet berisi semua lead proposal sesuai filter aktif. Baris yang
 * gagal dikirimi email ditandai di kolom "Email Terkirim".
 */
export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return new Response("Forbidden!", { status: 403 });
  }

  try {
    const filters = {
      ...parseFilters(new URL(req.url).searchParams),
      page: 1,
    };

    const { total } = await loadDownloads(filters, { take: 1, skip: 0 });
    if (total === 0) {
      return new Response("No proposal downloads to export", { status: 404 });
    }
    if (total > MAX_EXPORT_ROWS) {
      return new Response(
        `Too many rows to export (${total.toLocaleString("id-ID")}). Narrow the filters to ${MAX_EXPORT_ROWS.toLocaleString("id-ID")} rows or fewer.`,
        { status: 413 },
      );
    }

    const rows: DownloadRow[] = [];
    for await (const row of iterateDownloads(filters)) {
      rows.push(row);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MindCare.id";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Proposal Downloads", {
      views: [{ state: "frozen", ySplit: 4 }],
      pageSetup: { paperSize: 9, orientation: "landscape", fitToWidth: 1 },
    });

    const lastLetter = sheet.getColumn(COLUMNS.length).letter;

    sheet.mergeCells(`A1:${lastLetter}1`);
    const title = sheet.getCell("A1");
    title.value = "Proposal Downloads";
    title.font = { bold: true, size: 16, color: { argb: COLORS.white } };
    title.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    title.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.navy },
    };
    sheet.getRow(1).height = 32;

    sheet.mergeCells(`A2:${lastLetter}2`);
    const subtitle = sheet.getCell("A2");
    subtitle.value = `${rows.length} pengunduh  ·  Diekspor ${formatDateTimeId(new Date())}`;
    subtitle.font = { size: 10, color: { argb: COLORS.white } };
    subtitle.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    subtitle.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.purple },
    };
    sheet.getRow(2).height = 20;
    sheet.getRow(3).height = 8;

    const headerRow = sheet.getRow(4);
    headerRow.values = COLUMNS.map((column) => column.header);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: COLORS.white } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.emerald },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: COLORS.border } },
        bottom: { style: "thin", color: { argb: COLORS.border } },
        left: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
    });

    rows.forEach((row, index) => {
      const excelRow = sheet.addRow([
        index + 1,
        row.event.title,
        row.eventName,
        row.fullName,
        row.email,
        row.phone,
        row.institution ?? "—",
        row.position ?? "—",
        row.source === "GENERATED" ? "Ringkasan" : "File asli",
        STATUS_LABEL[row.status],
        row.emailSentAt ? formatDateTimeId(row.emailSentAt) : "—",
        formatDateTimeId(row.createdAt),
      ]);

      excelRow.height = 20;
      excelRow.eachCell((cell, colNumber) => {
        fillBorder(cell);
        cell.alignment = { vertical: "middle", wrapText: false };

        if (index % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLORS.zebra },
          };
        }

        if (colNumber === 1) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.font = { color: { argb: COLORS.navy }, size: 10 };
        } else {
          cell.font = { size: 10 };
        }
      });

      // Kolom 10 = Status (setelah Sumber File di kolom 9).
      const statusCell = excelRow.getCell(10);
      if (row.status === "CONFIRMED") {
        statusCell.font = {
          bold: true,
          size: 10,
          color: { argb: COLORS.emerald },
        };
      } else if (row.status === "FAILED") {
        statusCell.font = { bold: true, size: 10, color: { argb: "FFDC2626" } };
      } else {
        statusCell.font = { size: 10, color: { argb: COLORS.purple } };
      }
    });

    COLUMNS.forEach((column, index) => {
      sheet.getColumn(index + 1).width = column.width;
    });

    sheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: COLUMNS.length },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const stamp = new Date().toISOString().slice(0, 10);

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="proposal-downloads-${stamp}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("EXPORT PROPOSAL DOWNLOADS XLSX ERROR:", error);
    return new Response("Failed to export proposal downloads", {
      status: 500,
    });
  }
}
