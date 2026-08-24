// PERINGATAN: SELURUH ISI SEMBILAN EVENT DI FILE INI FIKTIF.
//
// Judul, uraian, susunan acara, tanggal, kota, harga, dan jumlah pendaftarnya
// semuanya karangan. Tidak ada satu pun acara di bawah ini yang benar-benar
// akan berlangsung. Wajib diganti data asli sebelum pernah tayang publik —
// acara karangan lebih berbahaya daripada program karangan, karena orang bisa
// datang ke tempat dan tanggal yang tertulis di sini.
//
// Isi di bawah ditulis dengan tiga pantangan yang HARUS dipertahankan selama
// datanya masih karangan — sama seperti di `insights/data/articles.ts` dan
// `solutions/data/solutions.ts`: tidak ada angka statistik, tidak ada rujukan
// penelitian, dan tidak ada nama obat maupun dosis.
//
// Catatan nilai turunan (jangan diubah sepihak, ada harness yang menjaganya —
// `scripts/check-data-invariants.mjs`):
//
// 1. `registeredCount` tidak boleh melewati `quota`. `quota: null` berarti tanpa
//    batas kursi, bukan "belum diisi".
// 2. `agenda` adalah rincian dari `startDate`–`endDate`, bukan data lain. Jam
//    baris pertama WAJIB sama dengan jam mulai dan jam baris terakhir WAJIB sama
//    dengan jam selesai, dan antar baris tidak boleh ada lubang. Kalau tidak
//    dijaga, hero bisa bilang acaranya sampai 15:00 sambil susunan acaranya
//    berhenti 14:00.
// 3. `agenda.time` sengaja string bebas ("09:00 – 09:30"), bukan timestamp:
//    rundown internal tidak perlu dihitung, dan memaksanya jadi ISO berarti
//    mengarang zona waktu per baris. Zona waktu acara ada di `timeZone`.
// 4. `host.slug` berkind `professional` wajib ada di
//    `professionals/data/professionals.ts`. Salah tulis satu huruf = kartu
//    penyelenggara diam-diam kosong.

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
    about: [
      "Sesi daring satu setengah jam untuk siapa pun yang jantungnya berdebar, tangannya dingin, atau pikirannya mendadak kosong tiap kali harus bicara di depan orang. Pembawanya akan menjelaskan apa yang sebenarnya sedang terjadi di tubuh saat itu, lalu melatih beberapa cara menurunkannya.",
      "Bentuknya penjelasan singkat lalu latihan bersama, jadi siapkan tempat yang cukup tenang. Kamera tidak wajib dinyalakan dan tidak ada bagian yang menuntut peserta bercerita di depan yang lain.",
    ],
    agenda: [
      {
        id: "ev-1-a1",
        time: "19:00 – 19:20",
        title: "Apa yang terjadi di tubuh saat gugup",
      },
      {
        id: "ev-1-a2",
        time: "19:20 – 20:00",
        title: "Latihan pernapasan dan penataan pikiran",
      },
      {
        id: "ev-1-a3",
        time: "20:00 – 20:30",
        title: "Tanya jawab",
      },
    ],
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
    about: [
      "Sehari penuh latihan untuk orang yang sering jadi tempat pertama orang lain bercerita — guru, atasan langsung, pengurus lingkungan, relawan. Fokusnya bukan mengobati, tapi menenangkan, mendengarkan, dan tahu kapan harus berhenti lalu merujuk.",
      "Sebagian besar waktunya dipakai bermain peran berpasangan, jadi peserta akan bergantian menjadi pendamping dan yang didampingi. Jumlah kursi dibatasi supaya setiap orang dapat umpan balik langsung dari fasilitator.",
    ],
    agenda: [
      {
        id: "ev-2-a1",
        time: "09:00 – 09:30",
        title: "Pembukaan dan kesepakatan ruang aman",
      },
      {
        id: "ev-2-a2",
        time: "09:30 – 11:00",
        title: "Prinsip dasar pertolongan pertama psikologis",
      },
      {
        id: "ev-2-a3",
        time: "11:00 – 12:00",
        title: "Latihan mendengarkan tanpa menghakimi",
      },
      {
        id: "ev-2-a4",
        time: "12:00 – 13:00",
        title: "Istirahat",
      },
      {
        id: "ev-2-a5",
        time: "13:00 – 14:30",
        title: "Bermain peran: percakapan yang sulit",
      },
      {
        id: "ev-2-a6",
        time: "14:30 – 15:00",
        title: "Kapan merujuk dan ke mana",
      },
    ],
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
    about: [
      "Pertemuan tertutup untuk mereka yang kehilangan orang terdekat dalam satu tahun terakhir. Tidak ada materi yang diajarkan di sini; yang ada ruang untuk bercerita, dan pilihan untuk diam saja kalau belum siap bicara.",
      "Jumlah peserta dijaga tetap kecil supaya semua kebagian waktu, dan apa pun yang dibicarakan tidak dibawa keluar ruangan. Pemandunya psikolog yang menjaga alur pertemuan, bukan memberi nasihat.",
    ],
    agenda: [
      {
        id: "ev-3-a1",
        time: "16:00 – 16:20",
        title: "Perkenalan dan kesepakatan bersama",
      },
      {
        id: "ev-3-a2",
        time: "16:20 – 17:30",
        title: "Sesi bercerita bergilir",
      },
      {
        id: "ev-3-a3",
        time: "17:30 – 18:00",
        title: "Penutup dan rencana pertemuan berikutnya",
      },
    ],
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
    about: [
      "Sesi daring untuk yang tiap pagi sudah lelah bahkan sebelum pekerjaan dimulai. Bahasannya soal membedakan lelah yang pulih setelah istirahat dari lelah yang tidak pulih walau cuti sudah diambil, lalu apa yang bisa digeser lebih dulu ketika berhenti bekerja bukan pilihan.",
      "Bagian tanya jawab di akhir dibuat cukup panjang. Pertanyaan boleh dikirim lebih dulu lewat halaman kontak dan akan dijawab tanpa menyebut nama pengirimnya.",
    ],
    agenda: [
      {
        id: "ev-4-a1",
        time: "19:30 – 19:50",
        title: "Lelah biasa dan lelah yang tidak pulih",
      },
      {
        id: "ev-4-a2",
        time: "19:50 – 20:30",
        title: "Tanda yang paling sering terlewat di pekerjaan sehari-hari",
      },
      {
        id: "ev-4-a3",
        time: "20:30 – 21:00",
        title: "Tanya jawab terbuka",
      },
    ],
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
    about: [
      "Pelatihan setengah hari untuk orang tua dan pengasuh anak usia sekolah. Bahannya berangkat dari keluhan yang paling sering muncul: perintah yang harus diulang lima kali, pagi yang selalu berakhir dengan bentakan, dan anak yang tiba-tiba berhenti bercerita.",
      "Tiap bagian ditutup dengan latihan, jadi peserta pulang dengan kalimat yang sudah dicoba, bukan sekadar catatan. Anak tidak perlu dibawa — sesinya untuk orang dewasa saja.",
    ],
    agenda: [
      {
        id: "ev-5-a1",
        time: "09:00 – 09:30",
        title: "Pembukaan dan pemetaan tantangan peserta",
      },
      {
        id: "ev-5-a2",
        time: "09:30 – 11:00",
        title: "Sesi satu: menetapkan batas tanpa membentak",
      },
      {
        id: "ev-5-a3",
        time: "11:00 – 12:00",
        title: "Latihan percakapan dengan anak",
      },
      {
        id: "ev-5-a4",
        time: "12:00 – 13:00",
        title: "Istirahat",
      },
      {
        id: "ev-5-a5",
        time: "13:00 – 14:00",
        title: "Sesi dua: menjaga hubungan saat anak menutup diri",
      },
    ],
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
    about: [
      "Sesi daring pendek soal hubungan antara jam tidur yang kacau dan pikiran yang susah tenang. Yang dibahas: bagian mana yang biasanya rusak lebih dulu — waktu tidur, waktu bangun, atau kebiasaan satu jam sebelum tidur — dan mana yang paling masuk akal dibenahi pertama.",
      "Sesi ini tidak membahas obat apa pun. Kalau kesulitan tidur sudah berlangsung lama atau mulai mengganggu pekerjaan, pembawanya akan menjelaskan jalur pemeriksaan yang sebaiknya ditempuh bersama tenaga profesional.",
    ],
    agenda: [
      {
        id: "ev-6-a1",
        time: "20:00 – 20:20",
        title: "Kenapa tidur yang berantakan memperberat cemas",
      },
      {
        id: "ev-6-a2",
        time: "20:20 – 20:55",
        title: "Membenahi jam tidur satu langkah sekali",
      },
      {
        id: "ev-6-a3",
        time: "20:55 – 21:15",
        title: "Tanya jawab",
      },
    ],
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
    about: [
      "Seminar sehari untuk atasan langsung dan tim SDM yang harus menanggapi keluhan tekanan kerja tapi belum punya prosedurnya. Bahasannya praktis: apa yang boleh ditanyakan, apa yang sebaiknya tidak, dan di mana peran perusahaan berhenti.",
      "Ada satu bagian berupa lokakarya menyusun draf kebijakan cuti pemulihan yang dikerjakan per kelompok, jadi peserta dari satu perusahaan sebaiknya datang bersama.",
    ],
    agenda: [
      {
        id: "ev-7-a1",
        time: "08:30 – 09:00",
        title: "Registrasi dan pembukaan",
      },
      {
        id: "ev-7-a2",
        time: "09:00 – 10:30",
        title: "Tekanan kerja: yang terlihat dan yang dilaporkan",
      },
      {
        id: "ev-7-a3",
        time: "10:30 – 12:00",
        title: "Menanggapi laporan tanpa melewati batas peran",
      },
      {
        id: "ev-7-a4",
        time: "12:00 – 13:00",
        title: "Istirahat",
      },
      {
        id: "ev-7-a5",
        time: "13:00 – 15:00",
        title: "Lokakarya menyusun kebijakan cuti pemulihan",
      },
      {
        id: "ev-7-a6",
        time: "15:00 – 16:00",
        title: "Diskusi panel dan penutup",
      },
    ],
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
    about: [
      "Lokakarya daring untuk orang yang sering mendengar cerita berat karena pekerjaannya: pengurus komunitas, petugas layanan aduan, pendamping korban. Fokusnya cara bertanya yang tidak memaksa orang mengulang kejadiannya, dan tanda bahwa percakapan sebaiknya dihentikan.",
      "Satu bagian khusus membahas batas peran pendamping, termasuk mengenali kelelahan pada diri sendiri setelah terlalu banyak mendengar. Materinya berat, jadi alurnya dibuat pelan dan peserta bebas keluar sebentar kapan pun perlu.",
    ],
    agenda: [
      {
        id: "ev-8-a1",
        time: "13:00 – 13:30",
        title: "Kesepakatan ruang dan batas materi",
      },
      {
        id: "ev-8-a2",
        time: "13:30 – 14:30",
        title: "Bertanya tanpa membuka luka",
      },
      {
        id: "ev-8-a3",
        time: "14:30 – 15:30",
        title: "Tanda percakapan harus dihentikan",
      },
      {
        id: "ev-8-a4",
        time: "15:30 – 16:00",
        title: "Menjaga diri sendiri sebagai pendamping",
      },
    ],
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
    about: [
      "Ruang bercerita bulanan untuk orang tua yang mengasuh anak sendiri — karena perpisahan, karena kehilangan, atau karena pasangan bekerja jauh. Yang dibicarakan biasanya hal sehari-hari: kelelahan yang tidak ada gantinya, rasa bersalah, dan pertanyaan anak yang sulit dijawab.",
      "Pertemuannya dipandu konselor keluarga yang menjaga agar semua kebagian bicara. Anak boleh dibawa dan ada pendamping yang menemani mereka di ruang sebelah.",
    ],
    agenda: [
      {
        id: "ev-9-a1",
        time: "15:30 – 15:50",
        title: "Perkenalan dan kesepakatan bersama",
      },
      {
        id: "ev-9-a2",
        time: "15:50 – 17:00",
        title: "Bercerita bergilir",
      },
      {
        id: "ev-9-a3",
        time: "17:00 – 17:30",
        title: "Penutup dan titipan untuk pertemuan depan",
      },
    ],
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

// Acara lain untuk blok "More events" di halaman detail.
//
// Yang sekategori didahulukan, lalu sisanya diisi acara terdekat. Berbeda dari
// `getRelatedArticles` — yang cabang "sekategori"-nya selama ini mati karena tiap
// artikel bertopik unik — cabang di sini benar-benar terpakai: kategori webinar
// dipakai tiga event dan workshop maupun support group dua-dua.
//
// Yang sudah lewat SELALU dikeluarkan, termasuk saat halaman yang sedang dibuka
// adalah acara yang sudah lewat. Menawarkan acara yang tanggalnya sudah berlalu
// sebagai "acara lain" tidak ada gunanya bagi orang yang mencari sesuatu untuk
// diikuti.
export async function getRelatedEvents(
  slug: string,
  now: string,
  limit = 3,
): Promise<MindcareEvent[]> {
  const current = events.find((event) => event.slug === slug);

  const upcoming = events
    .filter((event) => event.slug !== slug && !hasEnded(event, now))
    .sort(compareByStartAsc);

  const sameCategory = current
    ? upcoming.filter(
        (event) => event.category.slug === current.category.slug,
      )
    : [];
  const others = upcoming.filter((event) => !sameCategory.includes(event));

  return [...sameCategory, ...others].slice(0, limit);
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
