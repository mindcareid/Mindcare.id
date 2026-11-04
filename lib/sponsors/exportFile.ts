/*
 * Penamaan berkas ekspor sponsor.
 *
 * Judul event ikut ke nama berkas supaya file yang diunduh tim sponsor mudah
 * dikenali tanpa dibuka — beberapa event berjalan bersamaan dan nama seperti
 * "sponsor-applications-2026-11-04.xlsx" tidak memberi tahu event yang mana.
 *
 * Aturan:
 * - Nama event dibersihkan jadi bentuk aman untuk nama berkas (huruf, angka,
 *   tanda hubung), karena judul bisa berisi tanda hubung panjang, spasi ganda,
 *   atau karakter yang ditolak sistem berkas.
 * - Judul yang terpotong TIDAK memotong kata di tengah.
 * - Cakupannya disebut supaya dua ekspor pada hari yang sama tidak tertukar:
 *   satu event (judulnya), beberapa event, atau semua event.
 */

export const SPONSOR_EXPORT_TITLE_MAX = 60;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** YYYY-MM-DD menurut jam lokal server — sama dengan yang dilihat admin. */
export function exportDateStamp(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Ubah teks bebas menjadi bagian nama berkas: huruf dan angka Latin dipertahankan
 * (diakritik dibuang), sisanya jadi satu tanda hubung. Tanpa ini, judul seperti
 * "Mental Health and Wellness  Exhibition  and Conference 2026" menghasilkan
 * nama berkas dengan spasi ganda.
 */
export function slugifyForFileName(text: string, maxLength: number): string {
  const ascii = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii.length <= maxLength) return ascii;

  const cut = ascii.slice(0, maxLength + 1);
  const lastDash = cut.lastIndexOf("-");
  const trimmed = lastDash > 0 ? cut.slice(0, lastDash) : ascii.slice(0, maxLength);
  return trimmed.replace(/-+$/g, "");
}

export function sponsorExportEventLabel({
  eventId,
  eventTitles,
}: {
  eventId?: number;
  eventTitles: string[];
}): string {
  const unique = [...new Set(eventTitles.filter((title) => title.trim()))];

  // Satu event dipilih: pakai judulnya, karena itu yang ingin dikenali.
  // `eventId` didahulukan dari jumlah judul: bila filter event dipilih tapi
  // hasilnya kosong karena filter lain, cakupannya tetap event itu.
  if (eventId && unique.length <= 1) {
    const slug = unique.length === 1
      ? slugifyForFileName(unique[0], SPONSOR_EXPORT_TITLE_MAX)
      : "";
    if (slug) return slug;
    return `event-${eventId}`;
  }

  // Beberapa event: jangan mengarang singkatan, cukup sebut jumlahnya.
  if (unique.length > 1) return `${unique.length}-events`;

  // Tanpa filter / tanpa data: seluruh event.
  return "all-events";
}

/**
 * Akhiran cakupan non-event: status dan pencarian.
 *
 * Tanpa ini, ekspor "Archived" dan "New" untuk event yang sama pada hari yang
 * sama menghasilkan nama berkas identik — dua berkas berbeda terlihat sama,
 * dan yang satu menimpa yang lain saat diunduh. Pencarian disingkat menjadi
 * potongan slug, bukan bentuk mentahnya.
 */
export function sponsorExportFilterSuffix({
  status,
  search,
}: {
  status?: string | null;
  search?: string | null;
}): string {
  const parts: string[] = [];

  if (status) parts.push(status.toLowerCase());
  if (search) {
    const slug = slugifyForFileName(search, 20);
    if (slug) parts.push(`q-${slug}`);
  }

  return parts.length > 0 ? `-${parts.join("-")}` : "";
}

export function sponsorExportFileName({
  date,
  eventId,
  eventTitles,
  status,
  search,
}: {
  date: Date;
  eventId?: number;
  eventTitles: string[];
  status?: string | null;
  search?: string | null;
}): string {
  const scope = sponsorExportEventLabel({ eventId, eventTitles });
  const filter = sponsorExportFilterSuffix({ status, search });
  return `sponsor-applications-${scope}${filter}-${exportDateStamp(date)}.xlsx`;
}

/**
 * Nama lembar kerja Excel. Excel menolak nama lebih dari 31 karakter dan
 * karakter : \ / ? * [ ]. Batasnya 31 KARAKTER, bukan byte, jadi dipotong
 * per karakter supaya "Mental Health and Well" tidak terpotong di tengah tanda.
 */
export const SPONSOR_SHEET_NAME_MAX = 31;

export function sponsorSheetName({
  eventId,
  eventTitles,
  fallback = "Sponsor Applications",
}: {
  eventId?: number;
  eventTitles: string[];
  fallback?: string;
}): string {
  const unique = [...new Set(eventTitles.filter((title) => title.trim()))];
  const base =
    eventId && unique.length === 1
      ? unique[0]
      : unique.length > 1
        ? `Sponsors (${unique.length} events)`
        : fallback;

  const cleaned = base.replace(/[:\\/?*[\]]/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length <= SPONSOR_SHEET_NAME_MAX) return cleaned;

  const cut = cleaned.slice(0, SPONSOR_SHEET_NAME_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > 10 ? cut.slice(0, lastSpace) : cut;
  return trimmed.replace(/[\s:]+$/g, "");
}
