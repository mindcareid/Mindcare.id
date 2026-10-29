import ExcelJS from "exceljs";
import { getAdminUser } from "@/lib/adminGuard";
import {
  MAX_EXPORT_ROWS,
  type RegistrationFilters,
} from "@/lib/cadmin/eventRegistrations.shared";
import {
  type AttendeeFieldMeta,
  type RegistrationRow,
  describeAttendeeData,
  iterateRegistrations,
  loadAttendeeFields,
  loadRegistrations,
  parseFilters,
} from "@/lib/cadmin/eventRegistrations";

/** Warna diambil dari token brand di `app/globals.css`. */
const COLORS = {
  navy: "FF154375",
  purple: "FF63509E",
  emerald: "FF157768",
  border: "FFD6DCE5",
  zebra: "FFF4F6F9",
  white: "FFFFFFFF",
} as const;

/**
 * Satu event = satu sheet, supaya judul dan kolom jawaban tidak tercampur
 * antar event (dua event boleh punya field berlabel sama).
 */
type EventGroup = {
  eventId: number;
  eventTitle: string;
  eventStartDate: Date;
  rows: RegistrationRow[];
};

/** Nama sheet maksimal 31 karakter dan tidak boleh `[]:*?/\`. */
function sheetName(title: string, used: Set<string>): string {
  const base =
    title.replace(/[[\]:*?/\\]/g, " ").trim().slice(0, 31) || "Sheet";
  let name = base;
  let n = 2;
  while (used.has(name.toLowerCase())) {
    const suffix = ` (${n})`;
    name = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    n += 1;
  }
  used.add(name.toLowerCase());
  return name;
}

function formatDateId(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

function formatDateTimeId(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

/** Kolom dasar yang selalu tampil, sebelum kolom jawaban registrasi. */
const BASE_COLUMNS = [
  { header: "No", width: 6 },
  { header: "Nama", width: 26 },
  { header: "Email", width: 32 },
  { header: "Telepon", width: 18 },
  { header: "Kode Tiket", width: 26 },
  { header: "Status Order", width: 14 },
  { header: "Biaya (IDR)", width: 16 },
  { header: "Tanggal Daftar", width: 20 },
  { header: "Check-in", width: 12 },
  { header: "Waktu Check-in", width: 20 },
] as const;

function buildAnswerColumns(group: EventGroup, fields: AttendeeFieldMeta[]) {
  // Gabungan field terdaftar + key mentah yang sudah tidak punya definisi,
  // supaya jawaban lama tetap ikut terekspor.
  const keys = new Set<string>(fields.map((field) => field.key));
  for (const row of group.rows) {
    for (const item of describeAttendeeData(row.attendeeData, undefined)) {
      keys.add(item.key);
    }
  }

  const labelByKey = new Map(fields.map((f) => [f.key, f.label]));
  return [...keys].map((key) => ({
    key,
    header: labelByKey.get(key) ?? key,
  }));
}

function buildSheet(
  workbook: ExcelJS.Workbook,
  group: EventGroup,
  fields: AttendeeFieldMeta[],
  usedNames: Set<string>,
) {
  const sheet = workbook.addWorksheet(
    sheetName(group.eventTitle, usedNames),
    {
      views: [{ state: "frozen", ySplit: 5 }],
      pageSetup: { paperSize: 9, orientation: "landscape", fitToWidth: 1 },
    },
  );

  const answerColumns = buildAnswerColumns(group, fields);
  const lastCol = BASE_COLUMNS.length + answerColumns.length;
  const lastLetter = sheet.getColumn(lastCol).letter;

  // --- Judul ---
  sheet.mergeCells(`A1:${lastLetter}1`);
  const title = sheet.getCell("A1");
  title.value = group.eventTitle;
  title.font = { bold: true, size: 16, color: { argb: COLORS.white } };
  title.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.navy } };
  sheet.getRow(1).height = 32;

  // --- Subjudul: tanggal event + jumlah + waktu ekspor ---
  sheet.mergeCells(`A2:${lastLetter}2`);
  const subtitle = sheet.getCell("A2");
  subtitle.value = `${formatDateId(group.eventStartDate)}  ·  ${group.rows.length} pendaftar  ·  Diekspor ${formatDateTimeId(new Date())}`;
  subtitle.font = { size: 10, color: { argb: COLORS.white } };
  subtitle.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  subtitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.purple } };
  sheet.getRow(2).height = 20;

  // Baris 3 sengaja kosong sebagai pemisah.
  sheet.getRow(3).height = 8;

  // --- Header tabel ---
  const headerRow = sheet.getRow(4);
  const headers = [
    ...BASE_COLUMNS.map((column) => column.header),
    ...answerColumns.map((column) => column.header),
  ];
  headerRow.values = headers;
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10, color: { argb: COLORS.white } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.emerald } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.border } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
      left: { style: "thin", color: { argb: COLORS.border } },
      right: { style: "thin", color: { argb: COLORS.border } },
    };
  });
  sheet.getRow(5).height = 6; // jarak tipis setelah header

  // --- Data ---
  group.rows.forEach((row, index) => {
    const values = new Map(
      describeAttendeeData(row.attendeeData, undefined).map((item) => [
        item.key,
        item.value,
      ]),
    );

    const excelRow = sheet.addRow([
      index + 1,
      row.attendeeName || "—",
      row.attendeeEmail,
      row.attendeePhone ?? "—",
      row.code,
      row.orderStatus,
      // Event gratis bernilai 0 — tulis "Gratis", bukan "Rp 0", supaya jelas.
      row.orderAmount === 0 ? "Gratis" : row.orderAmount,
      formatDateTimeId(row.registeredAt),
      row.isCheckedIn ? "Hadir" : "Belum",
      row.checkedAt ? formatDateTimeId(row.checkedAt) : "—",
      ...answerColumns.map((column) => values.get(column.key) ?? "—"),
    ]);

    excelRow.height = 20;
    excelRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "hair", color: { argb: COLORS.border } },
        bottom: { style: "hair", color: { argb: COLORS.border } },
        left: { style: "hair", color: { argb: COLORS.border } },
        right: { style: "hair", color: { argb: COLORS.border } },
      };
      cell.alignment = { vertical: "middle", wrapText: false };

      // Zebra: baris genap diberi latar tipis supaya mudah dibaca.
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
      } else if (colNumber === 7) {
        if (typeof cell.value === "number") {
          cell.numFmt = '"Rp" #,##0';
        }
        cell.alignment = { vertical: "middle", horizontal: "right" };
      } else if (colNumber === 9) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.font = { size: 10 };
      }
    });

    // Warna status & check-in supaya mata langsung menangkap.
    const statusCell = excelRow.getCell(6);
    if (row.orderStatus === "PAID") {
      statusCell.font = { bold: true, size: 10, color: { argb: COLORS.emerald } };
    } else if (row.orderStatus === "PENDING") {
      statusCell.font = { bold: true, size: 10, color: { argb: COLORS.purple } };
    } else {
      statusCell.font = { size: 10, color: { argb: "FF8A8A8A" } };
    }

    const checkCell = excelRow.getCell(9);
    if (row.isCheckedIn) {
      checkCell.font = { bold: true, size: 10, color: { argb: COLORS.emerald } };
    } else {
      checkCell.font = { size: 10, color: { argb: "FF8A8A8A" } };
    }
  });

  // --- Lebar kolom & auto-filter ---
  BASE_COLUMNS.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width;
  });
  answerColumns.forEach((column, index) => {
    const width = Math.min(
      Math.max(
        column.header.length + 4,
        ...group.rows.map(
          (row) => (String(row.attendeeData[column.key] ?? "") || "—").length + 2,
        ),
      ),
      40,
    );
    sheet.getColumn(BASE_COLUMNS.length + index + 1).width = width;
  });

  sheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4, column: lastCol },
  };

  return sheet;
}

/**
 * GET /api/cadmin/event-registrations/export-xlsx
 *
 * Excel rapi untuk daftar hadir: satu sheet per event, judul berwarna,
 * header beku, auto-filter, dan nomor urut. CSV lama tetap tersedia.
 */
export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return new Response("Forbidden!", { status: 403 });
  }

  try {
    const filters: RegistrationFilters = {
      ...parseFilters(new URL(req.url).searchParams),
      page: 1,
    };

    const { total } = await loadRegistrations(filters, { take: 1, skip: 0 });
    if (total === 0) {
      return new Response("No registrations to export", { status: 404 });
    }
    if (total > MAX_EXPORT_ROWS) {
      return new Response(
        `Too many registrants to export (${total.toLocaleString("id-ID")}). Narrow the filters to ${MAX_EXPORT_ROWS.toLocaleString("id-ID")} rows or fewer.`,
        { status: 413 },
      );
    }

    // Kumpulkan per event, sekaligus catat field kustom tiap event.
    const groups = new Map<number, EventGroup>();
    for await (const row of iterateRegistrations(filters)) {
      let group = groups.get(row.eventId);
      if (!group) {
        group = {
          eventId: row.eventId,
          eventTitle: row.eventTitle,
          eventStartDate: row.eventStartDate,
          rows: [],
        };
        groups.set(row.eventId, group);
      }
      group.rows.push(row);
    }

    const fieldsByEvent = await loadAttendeeFields([...groups.keys()]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MindCare.id";
    workbook.created = new Date();

    const usedNames = new Set<string>();
    // Event terbaru lebih dulu, konsisten dengan urutan tabel.
    const ordered = [...groups.values()].sort(
      (a, b) => b.eventStartDate.getTime() - a.eventStartDate.getTime(),
    );

    for (const group of ordered) {
      buildSheet(workbook, group, fieldsByEvent.get(group.eventId) ?? [], usedNames);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const stamp = new Date().toISOString().slice(0, 10);

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="registrasi-event-${stamp}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("EXPORT EVENT REGISTRATIONS XLSX ERROR:", error);
    return new Response("Failed to export registrations", { status: 500 });
  }
}
