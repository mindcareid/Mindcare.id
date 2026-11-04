import ExcelJS from "exceljs";

import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminGuard";
import {
  SPONSOR_MAX_EXPORT_ROWS,
  SPONSOR_STATUS_LABEL,
  parseSponsorFilters,
} from "@/lib/sponsors/shared";
import {
  loadSponsorApplicationsForExport,
  normalizeBenefits,
} from "@/lib/sponsors/queries";
import { sponsorExportFileName, sponsorSheetName } from "@/lib/sponsors/exportFile";

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
  { header: "Reference", width: 20 },
  { header: "Event", width: 30 },
  { header: "Package", width: 20 },
  { header: "Price (IDR)", width: 16 },
  { header: "Company", width: 28 },
  { header: "Address", width: 34 },
  { header: "Country", width: 16 },
  { header: "Website", width: 26 },
  { header: "Company Email", width: 26 },
  { header: "PIC Name", width: 24 },
  { header: "PIC Position", width: 22 },
  { header: "PIC Phone", width: 18 },
  { header: "PIC Email", width: 28 },
  { header: "Note", width: 34 },
  { header: "Status", width: 12 },
  { header: "Submitted", width: 20 },
] as const;

const PRICE_COLUMN = 5;
const COUNTRY_COLUMN = 8;
const NOTE_COLUMN = 15;
const STATUS_COLUMN = 16;

function formatDateTimeId(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function hairBorder() {
  return {
    top: { style: "hair" as const, color: { argb: COLORS.border } },
    bottom: { style: "hair" as const, color: { argb: COLORS.border } },
    left: { style: "hair" as const, color: { argb: COLORS.border } },
    right: { style: "hair" as const, color: { argb: COLORS.border } },
  };
}

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return new Response("Forbidden!", { status: 403 });
  }

  try {
    const filters = parseSponsorFilters(new URL(req.url).searchParams);

    const result = await loadSponsorApplicationsForExport(
      {
        eventId: filters.eventId,
        status: filters.status,
        search: filters.search,
      },
      SPONSOR_MAX_EXPORT_ROWS,
    );

    if (result.tooMany) {
      return new Response(
        `Too many rows to export (${result.total.toLocaleString("en-US")}). Narrow the filters to ${SPONSOR_MAX_EXPORT_ROWS.toLocaleString("en-US")} rows or fewer.`,
        { status: 413 },
      );
    }

    if (result.rows.length === 0) {
      return new Response("No sponsor applications to export", { status: 404 });
    }

    const rows = result.rows;
    const eventTitles = rows.map((row) => row.event.title);
    // Satu tanggal dipakai nama berkas dan subjudul, supaya isi file dan
    // namanya tidak bisa berbeda hari saat ekspor lewat tengah malam.
    const exportedAt = new Date();

    // Nama negara diambil sekali per kode, bukan satu query per baris.
    const codes = [...new Set(rows.map((row) => row.countryCode))];
    const countries = await prisma.country.findMany({
      where: { code: { in: codes } },
      select: { code: true, name: true },
    });
    const countryName = new Map(countries.map((c) => [c.code, c.name]));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MindCare.id";
    workbook.created = exportedAt;

    const sheet = workbook.addWorksheet(
      sponsorSheetName({ eventId: filters.eventId, eventTitles }),
      {
        views: [{ state: "frozen", ySplit: 4 }],
        pageSetup: { paperSize: 9, orientation: "landscape", fitToWidth: 1 },
      },
    );

    const lastLetter = sheet.getColumn(COLUMNS.length).letter;

    sheet.mergeCells(`A1:${lastLetter}1`);
    const title = sheet.getCell("A1");
    // Judul event ditulis di dalam berkas juga, bukan hanya di nama berkas:
    // nama berkas bisa diganti saat dikirim lewat email atau chat.
    title.value =
      filters.eventId && eventTitles.length > 0
        ? `Sponsor Applications — ${eventTitles[0]}`
        : "Sponsor Applications";
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
    subtitle.value = `${rows.length} applications  ·  Exported ${formatDateTimeId(exportedAt)}  ·  Payment handled outside MindCare`;
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
    // Judul kolom harga mengikuti mata uang yang benar-benar tercatat pada
    // baris, bukan "IDR" yang dipatok: paket bisa saja tersimpan dalam mata
    // uang lain, dan label yang salah membuat tim finance membaca angka
    // dengan satuan yang keliru.
    const currencies = new Set(rows.map((row) => row.currencySnapshot));
    const priceHeader =
      currencies.size === 1 ? `Price (${[...currencies][0]})` : "Price";

    headerRow.values = COLUMNS.map((column) =>
      column.header === "Price (IDR)" ? priceHeader : column.header,
    );
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
      const notes = row.notes ?? "—";
      const benefitSummary = normalizeBenefits(row.tier.benefits)
        .map((benefit) =>
          benefit.detail
            ? `${benefit.title}: ${benefit.detail}`
            : benefit.title,
        )
        .join("; ");

      const excelRow = sheet.addRow([
        index + 1,
        row.referenceNo,
        row.event.title,
        row.tier.name,
        row.priceAmountSnapshot,
        row.companyName,
        row.address,
        countryName.get(row.countryCode) ?? row.countryCode,
        row.website ?? "—",
        row.companyEmail ?? "—",
        [row.picTitle, row.picFirstName, row.picLastName]
          .filter(Boolean)
          .join(" "),
        row.picPosition,
        row.picPhone,
        row.picEmail,
        notes,
        SPONSOR_STATUS_LABEL[row.status],
        formatDateTimeId(row.createdAt),
      ]);

      excelRow.height = 20;
      excelRow.eachCell((cell, colNumber) => {
        cell.border = hairBorder();
        cell.alignment = { vertical: "middle", wrapText: false };
        cell.font =
          colNumber === 1
            ? { color: { argb: COLORS.navy }, size: 10 }
            : { size: 10 };

        if (index % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLORS.zebra },
          };
        }

        if (colNumber === 1) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      });

      excelRow.getCell(PRICE_COLUMN).numFmt = "#,##0";
      excelRow.getCell(PRICE_COLUMN).alignment = {
        vertical: "middle",
        horizontal: "right",
      };
      excelRow.getCell(COUNTRY_COLUMN).alignment = { vertical: "middle" };
      excelRow.getCell(NOTE_COLUMN).alignment = {
        vertical: "middle",
        wrapText: true,
      };

      const statusCell = excelRow.getCell(STATUS_COLUMN);
      statusCell.font = {
        bold: true,
        size: 10,
        color: {
          argb: row.status === "PENDING" ? COLORS.purple : COLORS.emerald,
        },
      };

      if (benefitSummary) {
        statusCell.note = `Package includes: ${benefitSummary}`;
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
    // Nama berkas memuat judul event (atau jumlahnya bila beberapa event),
    // dan tanggal memakai jam lokal — `toISOString()` sebelumnya bisa
    // menulis tanggal kemarin untuk ekspor sore hari di WIB.
    const fileName = sponsorExportFileName({
      date: exportedAt,
      eventId: filters.eventId,
      eventTitles,
      // Cakupan filter ikut masuk nama: dua ekspor berbeda (mis. New vs
      // Archived) pada hari yang sama tidak boleh bernama sama.
      status: filters.status,
      search: filters.search,
    });

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("EXPORT SPONSOR APPLICATIONS XLSX ERROR:", error);
    return new Response("Failed to export sponsor applications", {
      status: 500,
    });
  }
}
