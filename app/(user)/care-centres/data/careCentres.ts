import type {
  CareCentre,
  CareCentreFacets,
  CentreKind,
  CentreService,
} from "../type/careCentre";

// Perubahan 24 Agustus 2026 (alasan lengkap di `design.md` bagian 20):
//
//   - `openingHours` yang dulu satu baris teks ("Sen–Sab, 08.00–20.00") kini
//     tujuh entri per centre. Jamnya sama dengan teks lamanya, tidak ada jam
//     baru yang dikarang — cuma bentuknya yang berubah supaya bisa dihitung.
//   - `isOpenNow` dihapus. Statusnya sekarang dihitung `isOpenAt()` di
//     `centreHours.ts` dari jam praktik plus waktu sekarang.
//   - `timeZone` ditambahkan. Denpasar dan Makassar `Asia/Makassar` (WITA),
//     tujuh sisanya `Asia/Jakarta` (WIB).
//   - `professionalCount` yang dulu ditulis tangan (7, 5, 4, 12, 3, 6, 4, 10, 5)
//     sekarang wajib sama dengan `professionalSlugs.length`. Angka lamanya tidak
//     bisa dibuktikan oleh apa pun; angka barunya bisa dihitung ulang siapa saja
//     dari daftar slugnya. Konsekuensinya angkanya jadi kecil — dua rumah sakit
//     di bawah berbunyi 3 dan 2, bukan 12 dan 10.
//
// Semua entri tujuh baris ditulis apa adanya, tanpa helper pembangun, supaya
// harness di `scripts/check-data-invariants.mjs` bisa membacanya dari teks file.
// Harness itu `.mjs` dan tidak mengimpor TypeScript; kalau jamnya dihasilkan
// fungsi, invarian "tepat tujuh hari berurutan" tidak bisa diperiksa sama sekali.

const services = {
  konsultasiPsikiatri: {
    id: "svc-1",
    slug: "konsultasi-psikiatri",
    name: "Konsultasi Psikiatri",
  },
  psikoterapi: { id: "svc-2", slug: "psikoterapi", name: "Psikoterapi" },
  tesPsikologi: {
    id: "svc-3",
    slug: "tes-psikologi",
    name: "Tes Psikologi",
  },
  konselingKeluarga: {
    id: "svc-4",
    slug: "konseling-keluarga",
    name: "Konseling Keluarga",
  },
  konselingAnakRemaja: {
    id: "svc-5",
    slug: "konseling-anak-remaja",
    name: "Konseling Anak & Remaja",
  },
  terapiKelompok: {
    id: "svc-6",
    slug: "terapi-kelompok",
    name: "Terapi Kelompok",
  },
  rehabilitasi: { id: "svc-7", slug: "rehabilitasi", name: "Rehabilitasi" },
  gawatDarurat: {
    id: "svc-8",
    slug: "gawat-darurat",
    name: "Layanan Gawat Darurat",
  },
} satisfies Record<string, CentreService>;

const careCentres: CareCentre[] = [
  {
    id: "centre-1",
    slug: "klinik-jiwa-sehat-kemang",
    name: "Klinik Jiwa Sehat Kemang",
    kind: "Klinik",
    photoUrl: null,
    verification: {
      review: "approved",
      checkedOn: "2026-03-05",
      validUntil: "2028-03-04",
      source: "submission",
    },
    openingHours: [
      { day: 1, opens: "08:00", closes: "20:00" },
      { day: 2, opens: "08:00", closes: "20:00" },
      { day: 3, opens: "08:00", closes: "20:00" },
      { day: 4, opens: "08:00", closes: "20:00" },
      { day: 5, opens: "08:00", closes: "20:00" },
      { day: 6, opens: "08:00", closes: "20:00" },
      { day: 7, opens: null, closes: null },
    ],
    openingNote: null,
    timeZone: "Asia/Jakarta",
    services: [
      services.konsultasiPsikiatri,
      services.psikoterapi,
      services.tesPsikologi,
    ],
    address: {
      street: "Jl. Kemang Raya No. 12",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12730",
    },
    coordinates: { latitude: -6.2615, longitude: 106.8106 },
    phone: "(021) 5550 1180",
    acceptsBpjs: false,
    professionalSlugs: ["anindita-rahmawati", "jelita-anggraini"],
    professionalCount: 2,
    createdAt: "2026-04-02T02:00:00.000Z",
  },
  {
    id: "centre-2",
    slug: "pusat-konseling-cakrawala",
    name: "Pusat Konseling Cakrawala",
    kind: "Pusat Konseling",
    photoUrl: null,
    verification: {
      review: "approved",
      checkedOn: "2026-01-22",
      validUntil: "2027-10-31",
      source: "submission",
    },
    openingHours: [
      { day: 1, opens: "09:00", closes: "18:00" },
      { day: 2, opens: "09:00", closes: "18:00" },
      { day: 3, opens: "09:00", closes: "18:00" },
      { day: 4, opens: "09:00", closes: "18:00" },
      { day: 5, opens: "09:00", closes: "18:00" },
      { day: 6, opens: null, closes: null },
      { day: 7, opens: null, closes: null },
    ],
    openingNote: null,
    timeZone: "Asia/Jakarta",
    services: [
      services.psikoterapi,
      services.konselingKeluarga,
      services.terapiKelompok,
    ],
    address: {
      street: "Jl. Cihampelas No. 88",
      city: "Bandung",
      province: "Jawa Barat",
      postalCode: "40131",
    },
    coordinates: { latitude: -6.9147, longitude: 107.6098 },
    phone: "(022) 5550 2214",
    acceptsBpjs: false,
    professionalSlugs: ["oktavia-rahayu"],
    professionalCount: 1,
    createdAt: "2026-04-05T02:00:00.000Z",
  },
  {
    id: "centre-3",
    slug: "klinik-psikologi-adyatma",
    name: "Klinik Psikologi Adyatma",
    kind: "Klinik",
    photoUrl: null,
    verification: {
      review: "pending",
      checkedOn: null,
      validUntil: null,
      source: null,
    },
    openingHours: [
      { day: 1, opens: "10:00", closes: "17:00" },
      { day: 2, opens: "10:00", closes: "17:00" },
      { day: 3, opens: "10:00", closes: "17:00" },
      { day: 4, opens: "10:00", closes: "17:00" },
      { day: 5, opens: "10:00", closes: "17:00" },
      { day: 6, opens: null, closes: null },
      { day: 7, opens: null, closes: null },
    ],
    openingNote: null,
    timeZone: "Asia/Jakarta",
    services: [
      services.tesPsikologi,
      services.konselingAnakRemaja,
      services.psikoterapi,
    ],
    address: {
      street: "Jl. Kaliurang KM 5 No. 21",
      city: "Yogyakarta",
      province: "DI Yogyakarta",
      postalCode: "55281",
    },
    coordinates: { latitude: -7.7956, longitude: 110.3695 },
    phone: "(0274) 5550 337",
    acceptsBpjs: false,
    professionalSlugs: ["chandra-wijaya"],
    professionalCount: 1,
    createdAt: "2026-04-09T02:00:00.000Z",
  },
  {
    id: "centre-4",
    slug: "rsu-bina-nurani",
    name: "RSU Bina Nurani",
    kind: "Rumah Sakit",
    photoUrl: null,
    verification: {
      review: "approved",
      checkedOn: "2026-04-14",
      validUntil: "2029-04-13",
      source: "registry",
    },
    openingHours: [
      { day: 1, opens: "00:00", closes: "24:00" },
      { day: 2, opens: "00:00", closes: "24:00" },
      { day: 3, opens: "00:00", closes: "24:00" },
      { day: 4, opens: "00:00", closes: "24:00" },
      { day: 5, opens: "00:00", closes: "24:00" },
      { day: 6, opens: "00:00", closes: "24:00" },
      { day: 7, opens: "00:00", closes: "24:00" },
    ],
    openingNote:
      "Jam di atas jam layanan gawat darurat. Poliklinik jiwa mengikuti jadwal dokter.",
    timeZone: "Asia/Jakarta",
    services: [
      services.konsultasiPsikiatri,
      services.gawatDarurat,
      services.rehabilitasi,
      services.psikoterapi,
    ],
    address: {
      street: "Jl. Raya Darmo No. 145",
      city: "Surabaya",
      province: "Jawa Timur",
      postalCode: "60241",
    },
    coordinates: { latitude: -7.2575, longitude: 112.7521 },
    phone: "(031) 5550 4460",
    acceptsBpjs: true,
    professionalSlugs: [
      "dian-puspitasari",
      "kurniawan-adiputra",
      "laila-fitriani",
    ],
    professionalCount: 3,
    createdAt: "2026-04-12T02:00:00.000Z",
  },
  {
    id: "centre-5",
    slug: "puskesmas-cempaka-wangi",
    name: "Puskesmas Cempaka Wangi",
    kind: "Puskesmas",
    photoUrl: null,
    verification: {
      review: "approved",
      checkedOn: "2026-05-20",
      validUntil: "2029-12-31",
      source: "registry",
    },
    openingHours: [
      { day: 1, opens: "07:30", closes: "15:00" },
      { day: 2, opens: "07:30", closes: "15:00" },
      { day: 3, opens: "07:30", closes: "15:00" },
      { day: 4, opens: "07:30", closes: "15:00" },
      { day: 5, opens: "07:30", closes: "15:00" },
      { day: 6, opens: "07:30", closes: "15:00" },
      { day: 7, opens: null, closes: null },
    ],
    openingNote: "Tutup pada hari libur nasional.",
    timeZone: "Asia/Jakarta",
    services: [services.konsultasiPsikiatri, services.konselingKeluarga],
    address: {
      street: "Jl. Cempaka Wangi No. 4",
      city: "Jakarta Pusat",
      province: "DKI Jakarta",
      postalCode: "10510",
    },
    coordinates: { latitude: -6.1862, longitude: 106.834 },
    phone: "(021) 5550 5502",
    acceptsBpjs: true,
    professionalSlugs: ["nadia-kusumawardani"],
    professionalCount: 1,
    createdAt: "2026-04-16T02:00:00.000Z",
  },
  {
    id: "centre-6",
    slug: "klinik-sahabat-pikiran",
    name: "Klinik Sahabat Pikiran",
    kind: "Klinik",
    photoUrl: null,
    verification: {
      review: "none",
      checkedOn: null,
      validUntil: null,
      source: null,
    },
    openingHours: [
      { day: 1, opens: "09:00", closes: "19:00" },
      { day: 2, opens: "09:00", closes: "19:00" },
      { day: 3, opens: "09:00", closes: "19:00" },
      { day: 4, opens: "09:00", closes: "19:00" },
      { day: 5, opens: "09:00", closes: "19:00" },
      { day: 6, opens: "09:00", closes: "19:00" },
      { day: 7, opens: null, closes: null },
    ],
    openingNote: null,
    timeZone: "Asia/Jakarta",
    services: [
      services.psikoterapi,
      services.konselingAnakRemaja,
      services.terapiKelompok,
    ],
    address: {
      street: "Jl. Setia Budi No. 67",
      city: "Medan",
      province: "Sumatera Utara",
      postalCode: "20122",
    },
    coordinates: { latitude: 3.5952, longitude: 98.6722 },
    phone: "(061) 5550 6318",
    acceptsBpjs: false,
    professionalSlugs: ["fajar-ramadhan"],
    professionalCount: 1,
    createdAt: "2026-04-20T02:00:00.000Z",
  },
  {
    id: "centre-7",
    slug: "pusat-konseling-bali-tenang",
    name: "Pusat Konseling Bali Tenang",
    kind: "Pusat Konseling",
    photoUrl: null,
    verification: {
      review: "approved",
      checkedOn: "2026-02-09",
      validUntil: "2027-09-30",
      source: "submission",
    },
    openingHours: [
      { day: 1, opens: "09:00", closes: "17:00" },
      { day: 2, opens: "09:00", closes: "17:00" },
      { day: 3, opens: "09:00", closes: "17:00" },
      { day: 4, opens: "09:00", closes: "17:00" },
      { day: 5, opens: "09:00", closes: "17:00" },
      { day: 6, opens: null, closes: null },
      { day: 7, opens: null, closes: null },
    ],
    openingNote: null,
    timeZone: "Asia/Makassar",
    services: [
      services.konselingKeluarga,
      services.psikoterapi,
      services.tesPsikologi,
    ],
    address: {
      street: "Jl. Sudirman No. 30",
      city: "Denpasar",
      province: "Bali",
      postalCode: "80114",
    },
    coordinates: { latitude: -8.6705, longitude: 115.2126 },
    phone: "(0361) 5550 771",
    acceptsBpjs: false,
    professionalSlugs: ["gita-maheswari"],
    professionalCount: 1,
    createdAt: "2026-04-24T02:00:00.000Z",
  },
  {
    id: "centre-8",
    slug: "rsu-sekar-arum",
    name: "RSU Sekar Arum",
    kind: "Rumah Sakit",
    photoUrl: null,
    verification: {
      review: "approved",
      checkedOn: "2026-06-02",
      validUntil: "2030-06-01",
      source: "registry",
    },
    openingHours: [
      { day: 1, opens: "00:00", closes: "24:00" },
      { day: 2, opens: "00:00", closes: "24:00" },
      { day: 3, opens: "00:00", closes: "24:00" },
      { day: 4, opens: "00:00", closes: "24:00" },
      { day: 5, opens: "00:00", closes: "24:00" },
      { day: 6, opens: "00:00", closes: "24:00" },
      { day: 7, opens: "00:00", closes: "24:00" },
    ],
    openingNote:
      "Jam di atas jam layanan gawat darurat. Poliklinik jiwa mengikuti jadwal dokter.",
    timeZone: "Asia/Jakarta",
    services: [
      services.konsultasiPsikiatri,
      services.gawatDarurat,
      services.rehabilitasi,
      services.konselingKeluarga,
    ],
    address: {
      street: "Jl. Pandanaran No. 98",
      city: "Semarang",
      province: "Jawa Tengah",
      postalCode: "50241",
    },
    coordinates: { latitude: -6.9932, longitude: 110.4203 },
    phone: "(024) 5550 8890",
    acceptsBpjs: true,
    professionalSlugs: ["hendra-saputra", "mahesa-pratama"],
    professionalCount: 2,
    createdAt: "2026-04-28T02:00:00.000Z",
  },
  {
    id: "centre-9",
    slug: "klinik-anindya-mandiri",
    name: "Klinik Anindya Mandiri",
    kind: "Klinik",
    photoUrl: null,
    verification: {
      review: "approved",
      checkedOn: "2024-09-11",
      validUntil: "2026-06-30",
      source: "submission",
    },
    openingHours: [
      { day: 1, opens: "08:00", closes: "18:00" },
      { day: 2, opens: "08:00", closes: "18:00" },
      { day: 3, opens: "08:00", closes: "18:00" },
      { day: 4, opens: "08:00", closes: "18:00" },
      { day: 5, opens: "08:00", closes: "18:00" },
      { day: 6, opens: "08:00", closes: "18:00" },
      { day: 7, opens: null, closes: null },
    ],
    openingNote: null,
    timeZone: "Asia/Makassar",
    services: [
      services.tesPsikologi,
      services.psikoterapi,
      services.konselingAnakRemaja,
      services.terapiKelompok,
    ],
    address: {
      street: "Jl. A. P. Pettarani No. 55",
      city: "Makassar",
      province: "Sulawesi Selatan",
      postalCode: "90222",
    },
    coordinates: { latitude: -5.1477, longitude: 119.4327 },
    phone: "(0411) 5550 913",
    acceptsBpjs: true,
    professionalSlugs: ["intan-larasati"],
    professionalCount: 1,
    createdAt: "2026-05-02T02:00:00.000Z",
  },
];

export async function getCareCentres(): Promise<CareCentre[]> {
  return [...careCentres].sort((a, b) => a.name.localeCompare(b.name, "id-ID"));
}

export async function getCareCentreBySlug(
  slug: string,
): Promise<CareCentre | null> {
  return careCentres.find((item) => item.slug === slug) ?? null;
}

/**
 * Centre tempat seorang profesional praktik.
 *
 * Arah relasinya dari centre ke profesional (`professionalSlugs`), jadi
 * pencariannya harus menyapu daftar centre — bukan membaca sebuah field di
 * profesionalnya. Mengembalikan `null` untuk profesional yang praktik mandiri,
 * dan itu keadaan yang sah, bukan data yang belum diisi.
 */
export async function getCentreOfProfessional(
  professionalSlug: string,
): Promise<CareCentre | null> {
  return (
    careCentres.find((centre) =>
      centre.professionalSlugs.includes(professionalSlug),
    ) ?? null
  );
}

export async function getCareCentreFacets(): Promise<CareCentreFacets> {
  const kinds = new Set<CentreKind>();
  const servicesBySlug = new Map<string, CentreService>();
  const cities = new Set<string>();

  for (const centre of careCentres) {
    kinds.add(centre.kind);
    cities.add(centre.address.city);
    for (const service of centre.services) {
      servicesBySlug.set(service.slug, service);
    }
  }

  return {
    kinds: [...kinds].sort((a, b) => a.localeCompare(b, "id-ID")),
    services: [...servicesBySlug.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "id-ID"),
    ),
    cities: [...cities].sort((a, b) => a.localeCompare(b, "id-ID")),
  };
}
