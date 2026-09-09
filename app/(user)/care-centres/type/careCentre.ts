// Kontrak data care centre.
//
// Aturan yang sama dengan `professionals/type/professional.ts` (rules.md pasal
// 6): bentuknya dibuat mirip response API/Prisma nanti, bukan yang paling
// nyaman untuk UI hari ini.
//
// Perubahan 24 Agustus 2026 — alasan lengkap di `design.md` bagian 20:
//
//   - `openingHours: string` ("Sen–Sab, 08.00–20.00") diganti tujuh entri
//     terstruktur. Teks itu tidak bisa dihitung, dan filter "Open now" di
//     halaman daftar hanya bisa jadi nyata kalau jamnya berupa angka.
//   - `isOpenNow: boolean` DIHAPUS. Buka atau tutup itu bukan sifat sebuah
//     tempat, melainkan hasil hitungan atas jam praktik dan waktu sekarang.
//     Selama ia berupa field, nilainya beku di mock data dan akan beku juga di
//     basis data — tidak ada yang memperbaruinya tiap menit.
//   - `timeZone` ditambahkan. Denpasar dan Makassar itu WITA (UTC+8), tujuh
//     centre lain WIB (UTC+7). Tanpa field ini "Open now" salah satu jam untuk
//     dua centre, dan itu jenis salah yang tidak memunculkan error apa pun.
//     Presedennya `MindcareEvent.timeZone`.
//   - `professionalSlugs` ditambahkan sebagai relasi keluar — pola yang sama
//     dengan `article.author.professionalSlug` dan `event.host.slug`.
//   - `professionalCount` tetap ada demi bentuk API, tapi jadi NILAI TURUNAN
//     dari `professionalSlugs.length` yang dijaga harness. Angka lamanya (7, 5,
//     4, 12, 3, 6, 4, 10, 5) karangan dan tidak bisa dibuktikan oleh apa pun di
//     dalam repo ini.
//   - `isVerified: boolean` diganti `verification` berbentuk objek — alasan
//     lengkap di `app/(user)/data/verification.ts` dan `design.md` bagian 21.

import type { Verification } from "../../data/verification";

export type CentreKind =
  | "Klinik"
  | "Rumah Sakit"
  | "Puskesmas"
  | "Pusat Konseling";

/**
 * Nomor hari ISO-8601: 1 = Senin, 7 = Minggu.
 *
 * Angka, bukan nama hari, karena tiga alasan: di basis data nanti ini kolom
 * integer atau enum, bukan teks bebas; urutannya bisa diperiksa harness tanpa
 * tabel padanan; dan label tampilannya jadi urusan satu tempat saja
 * (`WEEKDAY_LABELS` di `data/centreHours.ts`), bukan urusan datanya.
 */
export type CentreWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CentreOpeningHours {
  day: CentreWeekday;
  /**
   * Jam buka dan tutup dalam format "HH:MM" 24 jam, waktu setempat centre-nya
   * (lihat `CareCentre.timeZone`).
   *
   * `null` di KEDUA field berarti tutup hari itu, dan itu satu-satunya
   * kombinasi `null` yang sah — separuh terisi berarti datanya rusak, bukan
   * "belum diisi".
   *
   * `closes` boleh berbunyi "24:00" untuk tempat yang buka sampai tengah
   * malam. Jam tutup yang MELEWATI tengah malam (buka 20.00 tutup 01.00) belum
   * bisa diwakili bentuk ini; kalau nanti ada tempat seperti itu, entrinya
   * harus dipecah jadi dua hari, bukan dipaksa masuk satu baris.
   */
  opens: string | null;
  closes: string | null;
}

export interface CentreService {
  id: string;
  slug: string;
  name: string;
}

export interface CentreAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface CentreCoordinates {
  latitude: number;
  longitude: number;
}

export interface CareCentre {
  id: string;
  slug: string;
  name: string;
  kind: CentreKind;
  photoUrl: string | null;
  /**
   * Bentuknya sama dengan `Professional.verification`, tapi LABELNYA BEDA:
   * fasilitas memakai "Licence & permit checked", orang memakai "Licence
   * checked". Yang diperiksa memang tidak sama — fasilitas punya izin
   * operasional dan nomor registrasi fasilitas, orang punya surat tanda
   * registrasi dan surat izin praktik. Satu kata untuk dua klaim berbeda itu
   * justru yang diperbaiki pada 24 Agustus 2026.
   *
   * Puskesmas dan RSUD boleh ber-`source: "registry"` tanpa ada yang mengajukan;
   * lihat `VerificationSource`.
   */
  verification: Verification;
  /** Tepat tujuh entri, hari 1 sampai 7 berurutan, tanpa hari kembar. */
  openingHours: CentreOpeningHours[];
  /**
   * Satu baris keterangan di bawah tabel jam, mis. soal hari libur nasional.
   * `null` berarti memang tidak ada keterangan, bukan "belum ditulis".
   */
  openingNote: string | null;
  /** IANA time zone, mis. "Asia/Jakarta". Wajib, dipakai semua pemformat jam. */
  timeZone: string;
  services: CentreService[];
  address: CentreAddress;
  coordinates: CentreCoordinates;
  phone: string;
  acceptsBpjs: boolean;
  /**
   * Slug profesional yang praktik di sini. Kota tiap profesional wajib sama
   * dengan `address.city` — dijaga harness, karena satu orang tidak bisa
   * praktik di klinik yang berada di kota lain.
   */
  professionalSlugs: string[];
  /**
   * Turunan dari `professionalSlugs.length`. JANGAN dirender dari field ini —
   * render dari panjang arraynya, supaya tidak ada dua sumber untuk satu angka.
   */
  professionalCount: number;
  createdAt: string;
}

export interface CareCentreFacets {
  kinds: CentreKind[];
  services: CentreService[];
  cities: string[];
}
