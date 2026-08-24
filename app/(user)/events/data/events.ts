import type {
  EventCategory,
  EventFacets,
  EventFocusArea,
  EventFormat,
  EventHost,
  MindcareEvent,
} from "../type/event";
import { compareByStartAsc, hasEnded } from "./eventTime";

const categories = {
  webinar: { id: "evcat-1", slug: "webinar", name: "Webinar" },
  workshop: { id: "evcat-2", slug: "workshop", name: "Workshop" },
  supportGroup: {
    id: "evcat-3",
    slug: "support-group",
    name: "Support Group",
  },
  training: { id: "evcat-4", slug: "training", name: "Training" },
  seminar: { id: "evcat-5", slug: "seminar", name: "Seminar" },
} satisfies Record<string, EventCategory>;
const focusAreas = {
  kecemasan: { id: "evfocus-1", slug: "kecemasan", name: "Kecemasan" },
  stres: { id: "evfocus-2", slug: "stres", name: "Stres" },
  burnout: { id: "evfocus-3", slug: "burnout", name: "Burnout" },
  trauma: { id: "evfocus-4", slug: "trauma", name: "Trauma" },
  hubungan: { id: "evfocus-5", slug: "hubungan", name: "Hubungan" },
  pengembanganDiri: {
    id: "evfocus-6",
    slug: "pengembangan-diri",
    name: "Pengembangan Diri",
  },
  polaTidur: { id: "evfocus-7", slug: "pola-tidur", name: "Pola Tidur" },
  pengasuhan: { id: "evfocus-8", slug: "pengasuhan", name: "Pengasuhan" },
  dukaCita: { id: "evfocus-9", slug: "duka-cita", name: "Duka Cita" },
} satisfies Record<string, EventFocusArea>;
const hosts = {
  anindita: {
    kind: "professional",
    slug: "anindita-rahmawati",
    name: "Anindita Rahmawati",
    logoUrl: null,
  },
  dian: {
    kind: "professional",
    slug: "dian-puspitasari",
    name: "Dian Puspitasari",
    logoUrl: null,
  },
  fajar: {
    kind: "professional",
    slug: "fajar-ramadhan",
    name: "Fajar Ramadhan",
    logoUrl: null,
  },
  gita: {
    kind: "professional",
    slug: "gita-maheswari",
    name: "Gita Maheswari",
    logoUrl: null,
  },
  kemang: {
    kind: "centre",
    slug: "klinik-jiwa-sehat-kemang",
    name: "Klinik Jiwa Sehat Kemang",
    logoUrl: null,
  },
  cakrawala: {
    kind: "centre",
    slug: "pusat-konseling-cakrawala",
    name: "Pusat Konseling Cakrawala",
    logoUrl: null,
  },
  adyatma: {
    kind: "centre",
    slug: "klinik-psikologi-adyatma",
    name: "Klinik Psikologi Adyatma",
    logoUrl: null,
  },
  binaNurani: {
    kind: "centre",
    slug: "rsu-bina-nurani",
    name: "RSU Bina Nurani",
    logoUrl: null,
  },
  baliTenang: {
    kind: "centre",
    slug: "pusat-konseling-bali-tenang",
    name: "Pusat Konseling Bali Tenang",
    logoUrl: null,
  },
} satisfies Record<string, EventHost>;

const events: MindcareEvent[] = [
  {
    id: "ev-1",
    slug: "mengelola-kecemasan-sebelum-presentasi",
    title: "Mengelola Kecemasan Sebelum Presentasi",
    summary:
      "Teknik pernapasan, penataan pikiran, dan latihan singkat yang bisa dipakai sepuluh menit sebelum maju bicara di depan orang banyak.",
    coverImage: null,
    location: null,
    timeZone: "Asia/Jakarta",
    startDate: "2026-08-27T19:00:00+07:00",
    endDate: "2026-08-27T20:30:00+07:00",
    format: "Online",
    price: 0,
    quota: 300,
    registeredCount: 187,
    category: categories.webinar,
    focusAreas: [focusAreas.kecemasan, focusAreas.pengembanganDiri],
    host: hosts.anindita,
    createdAt: "2026-07-14T02:10:00.000Z",
  },
  {
    id: "ev-2",
    slug: "workshop-pertolongan-pertama-psikologis",
    title: "Workshop Pertolongan Pertama Psikologis",
    summary:
      "Latihan sehari penuh untuk mendampingi orang yang baru mengalami kejadian berat, termasuk kapan harus merujuk ke tenaga profesional.",
    coverImage: null,
    location: "Jakarta Selatan",
    timeZone: "Asia/Jakarta",
    startDate: "2026-09-05T09:00:00+07:00",
    endDate: "2026-09-05T15:00:00+07:00",
    format: "In Person",
    price: 350000,
    quota: 40,
    registeredCount: 36,
    category: categories.workshop,
    focusAreas: [focusAreas.trauma, focusAreas.stres],
    host: hosts.kemang,
    createdAt: "2026-07-02T04:25:00.000Z",
  },
  {
    id: "ev-3",
    slug: "kelompok-dukungan-untuk-yang-berduka",
    title: "Kelompok Dukungan untuk yang Berduka",
    summary:
      "Pertemuan tertutup dengan jumlah peserta terbatas, dipandu psikolog, untuk mereka yang kehilangan orang terdekat dalam setahun terakhir.",
    coverImage: null,
    location: "Bandung",
    timeZone: "Asia/Jakarta",
    startDate: "2026-09-19T16:00:00+07:00",
    endDate: "2026-09-19T18:00:00+07:00",
    format: "In Person",
    price: 0,
    quota: 20,
    registeredCount: 20,
    category: categories.supportGroup,
    focusAreas: [focusAreas.dukaCita],
    host: hosts.cakrawala,
    createdAt: "2026-07-21T07:40:00.000Z",
  },
  {
    id: "ev-4",
    slug: "burnout-kenali-batas-sebelum-terlambat",
    title: "Burnout: Kenali Batas Sebelum Terlambat",
    summary:
      "Membedakan lelah biasa dari kelelahan kerja yang sudah kronis, dan apa yang bisa diubah lebih dulu ketika berhenti bekerja bukan pilihan.",
    coverImage: null,
    location: null,
    timeZone: "Asia/Jakarta",
    startDate: "2026-10-03T19:30:00+07:00",
    endDate: "2026-10-03T21:00:00+07:00",
    format: "Online",
    price: 150000,
    quota: null,
    registeredCount: 412,
    category: categories.webinar,
    focusAreas: [focusAreas.burnout, focusAreas.stres],
    host: hosts.fajar,
    createdAt: "2026-08-01T03:15:00.000Z",
  },
  {
    id: "ev-5",
    slug: "pelatihan-pengasuhan-anak-usia-sekolah",
    title: "Pelatihan Pengasuhan Anak Usia Sekolah",
    summary:
      "Dua sesi praktis soal menetapkan batas tanpa membentak, menghadapi penolakan sekolah, dan menjaga hubungan saat anak mulai menutup diri.",
    coverImage: null,
    location: "Yogyakarta",
    timeZone: "Asia/Jakarta",
    startDate: "2026-10-17T09:00:00+07:00",
    endDate: "2026-10-17T14:00:00+07:00",
    format: "In Person",
    price: 250000,
    quota: 60,
    registeredCount: 31,
    category: categories.training,
    focusAreas: [focusAreas.pengasuhan, focusAreas.hubungan],
    host: hosts.adyatma,
    createdAt: "2026-08-05T06:00:00.000Z",
  },
  {
    id: "ev-6",
    slug: "tidur-cukup-pikiran-jernih",
    title: "Tidur Cukup, Pikiran Jernih",
    summary:
      "Kenapa jam tidur yang kacau memperberat kecemasan, dan urutan kebiasaan mana yang paling masuk akal dibenahi lebih dulu.",
    coverImage: null,
    location: null,
    timeZone: "Asia/Jakarta",
    startDate: "2026-11-07T20:00:00+07:00",
    endDate: "2026-11-07T21:15:00+07:00",
    format: "Online",
    price: 0,
    quota: 500,
    registeredCount: 96,
    category: categories.webinar,
    focusAreas: [focusAreas.polaTidur, focusAreas.stres],
    host: hosts.gita,
    createdAt: "2026-08-11T08:30:00.000Z",
  },
  {
    id: "ev-7",
    slug: "seminar-kesehatan-jiwa-di-tempat-kerja",
    title: "Seminar Kesehatan Jiwa di Tempat Kerja",
    summary:
      "Untuk atasan dan tim SDM: menyusun kebijakan cuti pemulihan, menanggapi laporan tekanan kerja, dan batas peran perusahaan.",
    coverImage: null,
    location: "Surabaya",
    timeZone: "Asia/Jakarta",
    startDate: "2026-11-21T08:30:00+07:00",
    endDate: "2026-11-21T16:00:00+07:00",
    format: "In Person",
    price: 500000,
    quota: 120,
    registeredCount: 74,
    category: categories.seminar,
    focusAreas: [focusAreas.burnout, focusAreas.stres, focusAreas.hubungan],
    host: hosts.binaNurani,
    createdAt: "2026-08-08T01:45:00.000Z",
  },
  {
    id: "ev-8",
    slug: "bicara-trauma-dengan-aman",
    title: "Bicara Trauma dengan Aman",
    summary:
      "Untuk pendamping dan relawan: cara mengajukan pertanyaan tanpa membuka luka, dan tanda bahwa percakapan harus dihentikan.",
    coverImage: null,
    location: null,
    timeZone: "Asia/Jakarta",
    startDate: "2026-07-11T13:00:00+07:00",
    endDate: "2026-07-11T16:00:00+07:00",
    format: "Online",
    price: 200000,
    quota: 80,
    registeredCount: 80,
    category: categories.workshop,
    focusAreas: [focusAreas.trauma],
    host: hosts.dian,
    createdAt: "2026-05-30T05:20:00.000Z",
  },
  {
    id: "ev-9",
    slug: "kelompok-dukungan-pengasuhan-tunggal",
    title: "Kelompok Dukungan Pengasuhan Tunggal",
    summary:
      "Ruang bercerita bulanan untuk orang tua yang mengasuh sendiri, dipandu konselor keluarga.",
    coverImage: null,
    location: "Denpasar",
    timeZone: "Asia/Jakarta",
    startDate: "2026-06-20T15:30:00+07:00",
    endDate: "2026-06-20T17:30:00+07:00",
    format: "In Person",
    price: 0,
    quota: 25,
    registeredCount: 22,
    category: categories.supportGroup,
    focusAreas: [focusAreas.pengasuhan, focusAreas.hubungan],
    host: hosts.baliTenang,
    createdAt: "2026-05-12T09:05:00.000Z",
  },
];

export async function getEvents(): Promise<MindcareEvent[]> {
  return [...events].sort(compareByStartAsc);
}

export async function getEventBySlug(
  slug: string,
): Promise<MindcareEvent | null> {
  return events.find((event) => event.slug === slug) ?? null;
}
export async function getUpcomingEvents(
  limit: number,
  now: string,
): Promise<MindcareEvent[]> {
  return [...events]
    .filter((event) => !hasEnded(event, now))
    .sort(compareByStartAsc)
    .slice(0, limit);
}
export async function getEventFacets(): Promise<EventFacets> {
  const categoryBySlug = new Map<string, EventCategory>();
  const formatSet = new Set<EventFormat>();

  for (const event of events) {
    categoryBySlug.set(event.category.slug, event.category);
    formatSet.add(event.format);
  }

  const formatOrder: EventFormat[] = ["Online", "In Person"];

  return {
    categories: [...categoryBySlug.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "id-ID"),
    ),
    formats: formatOrder.filter((format) => formatSet.has(format)),
  };
}
