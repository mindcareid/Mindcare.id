// Kontrak data profesional.
//
// PENTING (rules.md pasal 6): bentuk di sini dibuat mirip response API/Prisma
// nanti, bukan yang paling nyaman untuk UI. Konsekuensinya beberapa hal
// sengaja dibuat "lebih repot" dari yang perlu hari ini:
//
//   - `areasOfSupport` berupa objek ber-`slug`, bukan array string. Di database
//     ini hampir pasti tabel tag tersendiri. Filter juga jadi lebih tahan
//     banting karena mencocokkan slug, bukan teks tampilan yang bisa berubah.
//   - `location` dibuat nested supaya relasi terlihat sebagai relasi.
//   - enum ditulis sebagai union type, bukan string bebas.
//   - `startingPriceIdr` disimpan sebagai angka rupiah utuh, bukan string
//     terformat, supaya bisa diurutkan dan dihitung.
//
// Isi konten (gelar, area of support, nama kota) tetap bahasa Indonesia —
// rules.md pasal 7.

import type { Verification } from "../../data/verification";

export type ProfessionKind = "Psikolog" | "Psikiater" | "Konselor";

export type SessionMode = "Online" | "In Person";

export interface AreaOfSupport {
  id: string;
  slug: string;
  /** Label tampilan, bahasa Indonesia. Mis. "Kecemasan". */
  name: string;
}

export interface ProfessionalLocation {
  city: string;
  province: string;
}

/**
 * Pendekatan terapi, mis. "CBT" atau "Terapi Berfokus Solusi". Ber-`slug` seperti
 * `AreaOfSupport` karena di database ini tabel tersendiri.
 *
 * Bedanya dengan `areasOfSupport`: area of support itu MASALAH yang ditangani
 * ("Kecemasan"), pendekatan itu CARA menanganinya. Dua-duanya dirender sebagai
 * `Tag` tapi di blok terpisah supaya tidak tercampur.
 */
export interface TherapyApproach {
  id: string;
  slug: string;
  name: string;
}

/** Satu baris riwayat pendidikan. */
export interface EducationEntry {
  id: string;
  /** Mis. "Magister Psikologi Profesi". */
  degree: string;
  institution: string;
  year: number;
}

export interface ProfessionalService {
  id: string;
  slug: string;
  name: string;
  mode: SessionMode;
  durationMinutes: number;
  priceIdr: number;
}

export interface Professional {
  id: string;
  slug: string;
  fullName: string;
  credentials: string;
  profession: ProfessionKind;
  photoUrl: string | null;
  /**
   * Menggantikan `isVerified: boolean` pada 24 Agustus 2026 — alasan lengkap di
   * `app/(user)/data/verification.ts` dan `design.md` bagian 21.
   *
   * JANGAN dirender langsung. Keadaan yang dipakai UI adalah nilai turunan dari
   * `verificationStateOf(verification, now)`, karena "berlaku" dan "kedaluwarsa"
   * dibedakan oleh tanggal hari ini, bukan oleh isi field ini.
   *
   * Yang diverifikasi di sini ORANG, jadi labelnya "Licence checked" — bukan
   * label fasilitas. Verifikasi juga tidak menurun dari centre tempat dia
   * praktik: bekerja di rumah sakit terverifikasi bukan kredensial.
   */
  verification: Verification;
  isAvailableNow: boolean;
  areasOfSupport: AreaOfSupport[];
  sessionModes: SessionMode[];
  location: ProfessionalLocation;
  languages: string[];
  yearsOfExperience: number;
  startingPriceIdr: number;
  createdAt: string;
  headline: string;
  bio: string[];
  approaches: TherapyApproach[];
  education: EducationEntry[];
  services: ProfessionalService[];
  bookingUrl: string | null;
}
export interface ProfessionalFacets {
  professions: ProfessionKind[];
  areasOfSupport: AreaOfSupport[];
  sessionModes: SessionMode[];
  cities: string[];
}

export type ProfessionalSort =
  | "relevance"
  | "experience"
  | "price-asc"
  | "name-asc";
