import type {
  CareCentre,
  CentreOpeningHours,
  CentreWeekday,
} from "../type/careCentre";

// Semua perhitungan dan pemformatan jam praktik tinggal di file ini.
//
// File ini SENGAJA tidak punya `"use client"` dan sengaja terpisah dari
// `careCentres.ts`. Alasannya dua, dan dua-duanya sudah pernah menggigit di
// fitur lain:
//
//   1. Begitu sebuah modul punya `"use client"`, semua exportnya jadi client
//      reference dan tidak bisa DIPANGGIL dari server component. Halaman daftar
//      memanggil ini di klien (filter "Open now" hidup di komponen berstate),
//      halaman detail memanggilnya di server. Jadi modul ini harus netral.
//   2. Kalau fungsi-fungsi ini menempel di file mock data, komponen klien yang
//      cuma butuh satu pemformat akan menarik seluruh array centre ke bundel
//      browser.
//
// Perhatikan: SETIAP fungsi yang menyentuh "sekarang" wajib menerima
// `centre.timeZone`. Tanpa itu jamnya ikut zona waktu mesin yang merender — di
// server produksi bisa UTC, dan klinik Makassar yang tutup pukul 18:00 WITA akan
// terhitung masih buka satu jam lebih lama. Itu jenis salah yang tidak
// memunculkan error apa pun.

/** Urutan hari yang dipakai di seluruh UI. Satu-satunya sumber urutannya. */
export const CENTRE_DAYS: CentreWeekday[] = [1, 2, 3, 4, 5, 6, 7];

/**
 * Label hari bahasa Inggris — rules.md pasal 7: label tampilan Inggris,
 * sementara isi konten (nama kota, nama layanan) tetap Indonesia. Datanya
 * sendiri hanya menyimpan angka, jadi tabel padanannya cuma ada di sini.
 */
export const WEEKDAY_LABELS: Record<CentreWeekday, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

// Nama hari panjang bahasa Inggris dari ICU dipetakan balik ke nomor ISO. Pakai
// `weekday: "long"` dan locale `en-US` karena bentuk itu yang paling stabil
// antarversi ICU; singkatan bisa berubah ("Thu" vs "Thur").
const ISO_WEEKDAY_BY_NAME: Record<string, CentreWeekday> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

type ZoneFormatters = {
  weekday: Intl.DateTimeFormat;
  time: Intl.DateTimeFormat;
  zone: Intl.DateTimeFormat;
};

const formatterCache = new Map<string, ZoneFormatters>();

function formattersFor(timeZone: string): ZoneFormatters {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;

  const formatters: ZoneFormatters = {
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone }),
    // `hourCycle: "h23"` ditulis eksplisit, bukan `hour12: false`. Dengan
    // `hour12: false` beberapa versi ICU memberi "24:00" untuk tengah malam,
    // dan angka itu akan dibandingkan sebagai teks di `isOpenAt` — tengah malam
    // jadi terbaca lebih besar dari jam tutup mana pun.
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    }),
    // Label zonanya `id-ID` supaya keluar "WIB"/"WITA"/"WIT"; locale Inggris
    // memberi "GMT+7" yang jauh kurang berguna. Pola yang sama dengan
    // `events/data/eventTime.ts`.
    zone: new Intl.DateTimeFormat("id-ID", {
      timeZoneName: "short",
      timeZone,
    }),
  };

  formatterCache.set(timeZone, formatters);
  return formatters;
}

/** Nomor hari ISO di kota centre-nya pada saat `now`. */
export function weekdayAt(centre: CareCentre, now: string): CentreWeekday {
  const name = formattersFor(centre.timeZone).weekday.format(new Date(now));
  return ISO_WEEKDAY_BY_NAME[name] ?? 1;
}

/**
 * Jam dinding "HH:MM" di kota centre-nya pada saat `now`.
 *
 * Jangan diganti `new Date(now).getHours()` — itu mengembalikan jam menurut
 * zona waktu mesin yang menjalankannya, bukan zona kotanya.
 */
function localTimeAt(centre: CareCentre, now: string): string {
  return formattersFor(centre.timeZone).time.format(new Date(now));
}

export function hoursForWeekday(
  centre: CareCentre,
  day: CentreWeekday,
): CentreOpeningHours | null {
  return centre.openingHours.find((entry) => entry.day === day) ?? null;
}

/**
 * Buka atau tidak pada saat `now`. Menggantikan field `isOpenNow` yang dulu
 * ditulis tangan di mock data.
 *
 * Perbandingannya teks, dan itu sah karena "HH:MM" selalu dua digit dan
 * berpadding nol. Batas atas dipakai eksklusif: pukul 20:00 tepat di tempat yang
 * tutup 20:00 sudah dihitung tutup.
 */
export function isOpenAt(centre: CareCentre, now: string): boolean {
  const entry = hoursForWeekday(centre, weekdayAt(centre, now));
  if (!entry || entry.opens === null || entry.closes === null) return false;

  const time = localTimeAt(centre, now);
  return time >= entry.opens && time < entry.closes;
}

/** "08:00 – 20:00", "Open 24 hours", atau "Closed". */
export function formatOpeningRange(entry: CentreOpeningHours): string {
  if (entry.opens === null || entry.closes === null) return "Closed";
  if (entry.opens === "00:00" && entry.closes === "24:00") {
    return "Open 24 hours";
  }
  return `${entry.opens} – ${entry.closes}`;
}

/** Satu baris untuk kartu: "Today 08:00 – 20:00" atau "Closed today". */
export function summariseTodayHours(centre: CareCentre, now: string): string {
  const entry = hoursForWeekday(centre, weekdayAt(centre, now));
  if (!entry || entry.opens === null || entry.closes === null) {
    return "Closed today";
  }
  return `Today ${formatOpeningRange(entry)}`;
}

// Instan acuan yang TIDAK bergantung pada "sekarang". `Intl` menuntut sebuah
// Date untuk memberi label zona, tapi halaman detail tidak boleh jadi
// bergantung pada waktu hanya karena ingin menulis "WIB" di bawah tabel jam.
// Indonesia tidak punya daylight saving, jadi instan mana pun memberi jawaban
// yang sama — kalau suatu hari daftar ini memuat kota di negara yang punya DST,
// acuan ini harus diganti waktu nyata dan halamannya butuh `revalidate`.
const ZONE_LABEL_REFERENCE = new Date("2026-01-01T00:00:00.000Z");

/** "WIB", "WITA", atau "WIT". */
export function centreZoneLabel(centre: CareCentre): string {
  return (
    formattersFor(centre.timeZone)
      .zone.formatToParts(ZONE_LABEL_REFERENCE)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
}
