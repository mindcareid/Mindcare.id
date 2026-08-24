// PERINGATAN: SEMBILAN PROFIL DI FILE INI FIKTIF.
//
// Nama, gelar, riwayat pendidikan, tahun pengalaman, daftar layanan, dan seluruh
// harga di bawah adalah karangan. Tidak ada satu pun orang sungguhan di sini.
// Nama universitasnya memang institusi nyata, tapi tidak ada hubungan apa pun
// antara institusi itu dengan profil-profil karangan ini.
//
// Profil profesional kesehatan mental adalah jenis data yang paling mudah
// dianggap fakta oleh orang yang sedang mencari bantuan. SELURUH ISI FILE INI
// HARUS DIGANTI DATA ASLI SEBELUM HALAMAN INI PERNAH TAYANG KE PUBLIK.
// Lihat `prd.md` bagian 11.
//
// Field untuk halaman detail (`headline`, `bio`, `approaches`, `education`,
// `services`, `bookingUrl`) ditambahkan 20 Agustus 2026. Alasan tiap field ada di
// `design.md` bagian 16. Nomor STR/SIPP sengaja tidak ada — diaze
// mengecualikannya.

import type {
  AreaOfSupport,
  Professional,
  ProfessionalFacets,
  ProfessionKind,
  SessionMode,
  TherapyApproach,
} from "../type/professional";

const areas = {
  kecemasan: { id: "aos-1", slug: "kecemasan", name: "Kecemasan" },
  stres: { id: "aos-2", slug: "stres", name: "Stres" },
  burnout: { id: "aos-3", slug: "burnout", name: "Burnout" },
  depresi: { id: "aos-4", slug: "depresi", name: "Depresi" },
  trauma: { id: "aos-5", slug: "trauma", name: "Trauma" },
  hubungan: { id: "aos-6", slug: "hubungan", name: "Hubungan" },
  pengembanganDiri: {
    id: "aos-7",
    slug: "pengembangan-diri",
    name: "Pengembangan Diri",
  },
  polaTidur: { id: "aos-8", slug: "pola-tidur", name: "Pola Tidur" },
  pengasuhan: { id: "aos-9", slug: "pengasuhan", name: "Pengasuhan" },
  dukaCita: { id: "aos-10", slug: "duka-cita", name: "Duka Cita" },
} satisfies Record<string, AreaOfSupport>;

// Pendekatan terapi. Singkatan Inggris yang sudah dipakai apa adanya di kalangan
// praktisi Indonesia (CBT, ACT, EMDR) dibiarkan; yang punya padanan Indonesia yang
// lazim ditulis Indonesia. Pola yang sama dengan nama kategori event di
// `design.md` bagian 13.
const approaches = {
  cbt: { id: "apr-1", slug: "cbt", name: "CBT" },
  act: { id: "apr-2", slug: "act", name: "ACT" },
  emdr: { id: "apr-3", slug: "emdr", name: "EMDR" },
  psikodinamik: { id: "apr-4", slug: "psikodinamik", name: "Psikodinamik" },
  humanistik: { id: "apr-5", slug: "humanistik", name: "Humanistik" },
  mindfulness: { id: "apr-6", slug: "mindfulness", name: "Mindfulness" },
  berfokusSolusi: {
    id: "apr-7",
    slug: "terapi-berfokus-solusi",
    name: "Terapi Berfokus Solusi",
  },
  keluarga: { id: "apr-8", slug: "terapi-keluarga", name: "Terapi Keluarga" },
  farmakoterapi: { id: "apr-9", slug: "farmakoterapi", name: "Farmakoterapi" },
} satisfies Record<string, TherapyApproach>;

const professionals: Professional[] = [
  {
    id: "prof-1",
    slug: "anindita-rahmawati",
    fullName: "Anindita Rahmawati",
    credentials: "M.Psi., Psikolog",
    profession: "Psikolog",
    photoUrl: null,
    isVerified: true,
    isAvailableNow: true,
    areasOfSupport: [areas.kecemasan, areas.stres, areas.burnout],
    sessionModes: ["Online", "In Person"],
    location: { city: "Jakarta Selatan", province: "DKI Jakarta" },
    languages: ["Indonesia", "English"],
    yearsOfExperience: 9,
    startingPriceIdr: 385000,
    createdAt: "2026-01-14T02:00:00.000Z",
    headline:
      "Psikolog klinis yang mendampingi orang dewasa muda menghadapi kecemasan, tekanan kerja, dan kelelahan mental.",
    bio: [
      "Anindita bekerja terutama dengan orang dewasa muda yang sedang berhadapan dengan kecemasan, tekanan pekerjaan, dan kelelahan mental yang menumpuk. Sesi pertama biasanya dipakai untuk memetakan apa yang paling mengganggu sehari-hari, bukan langsung menetapkan rencana panjang.",
      "Pendekatannya bertumpu pada CBT, dengan latihan kesadaran diri sebagai pelengkap di sela sesi. Ia terbiasa bekerja bergantian antara sesi daring dan tatap muka untuk klien yang jadwalnya berubah-ubah.",
    ],
    approaches: [approaches.cbt, approaches.act, approaches.mindfulness],
    education: [
      {
        id: "edu-1-1",
        degree: "S1 Psikologi",
        institution: "Universitas Indonesia",
        year: 2013,
      },
      {
        id: "edu-1-2",
        degree: "Magister Psikologi Profesi, Klinis Dewasa",
        institution: "Universitas Indonesia",
        year: 2016,
      },
    ],
    services: [
      {
        id: "svc-1-1",
        slug: "konsultasi-individu-online",
        name: "Konsultasi Individu",
        mode: "Online",
        durationMinutes: 60,
        priceIdr: 385000,
      },
      {
        id: "svc-1-2",
        slug: "konsultasi-individu-tatap-muka",
        name: "Konsultasi Individu",
        mode: "In Person",
        durationMinutes: 60,
        priceIdr: 450000,
      },
      {
        id: "svc-1-3",
        slug: "konseling-pasangan",
        name: "Konseling Pasangan",
        mode: "In Person",
        durationMinutes: 90,
        priceIdr: 650000,
      },
    ],
    bookingUrl: "https://example.com/booking/anindita-rahmawati",
  },
  {
    id: "prof-2",
    slug: "bagas-priyatna",
    fullName: "Bagas Priyatna",
    credentials: "dr., Sp.KJ",
    profession: "Psikiater",
    photoUrl: null,
    isVerified: true,
    isAvailableNow: false,
    areasOfSupport: [areas.depresi, areas.kecemasan, areas.polaTidur],
    sessionModes: ["In Person"],
    location: { city: "Bandung", province: "Jawa Barat" },
    languages: ["Indonesia"],
    yearsOfExperience: 14,
    startingPriceIdr: 550000,
    createdAt: "2026-01-21T02:00:00.000Z",
    headline:
      "Psikiater dengan perhatian pada depresi, gangguan kecemasan, dan keluhan tidur yang berkepanjangan.",
    bio: [
      "Bagas menangani depresi, gangguan kecemasan, dan keluhan tidur yang sudah berlangsung lama dan mulai mempengaruhi pekerjaan. Sebagai psikiater ia dapat meresepkan obat, tapi tidak setiap keluhan berujung pada resep — pemeriksaan awal dipakai untuk memastikan apa yang sebenarnya dibutuhkan.",
      "Ia bekerja hanya secara tatap muka, karena pemeriksaan yang ia lakukan menuntut pengamatan langsung. Untuk klien yang juga menjalani psikoterapi, ia biasa berkoordinasi dengan psikolog yang menangani.",
    ],
    approaches: [approaches.farmakoterapi, approaches.cbt],
    education: [
      {
        id: "edu-2-1",
        degree: "Pendidikan Dokter",
        institution: "Universitas Padjadjaran",
        year: 2008,
      },
      {
        id: "edu-2-2",
        degree: "Spesialis Kedokteran Jiwa",
        institution: "Universitas Padjadjaran",
        year: 2015,
      },
    ],
    services: [
      {
        id: "svc-2-1",
        slug: "konsultasi-psikiatri",
        name: "Konsultasi Psikiatri",
        mode: "In Person",
        durationMinutes: 45,
        priceIdr: 550000,
      },
      {
        id: "svc-2-2",
        slug: "konsultasi-dan-asesmen",
        name: "Konsultasi dan Asesmen Lengkap",
        mode: "In Person",
        durationMinutes: 90,
        priceIdr: 850000,
      },
    ],
    bookingUrl: "https://example.com/booking/bagas-priyatna",
  },
  {
    id: "prof-3",
    slug: "chandra-wijaya",
    fullName: "Chandra Wijaya",
    credentials: "M.Psi., Psikolog",
    profession: "Psikolog",
    photoUrl: null,
    isVerified: true,
    isAvailableNow: true,
    areasOfSupport: [areas.trauma, areas.dukaCita, areas.kecemasan],
    sessionModes: ["Online"],
    location: { city: "Yogyakarta", province: "DI Yogyakarta" },
    languages: ["Indonesia", "English"],
    yearsOfExperience: 7,
    startingPriceIdr: 320000,
    createdAt: "2026-02-03T02:00:00.000Z",
    headline:
      "Psikolog klinis yang berfokus pada pemulihan pascatrauma dan pendampingan duka.",
    bio: [
      "Chandra mendampingi orang yang sedang memulihkan diri setelah peristiwa yang membekas, termasuk kehilangan orang terdekat. Ia menekankan bahwa laju pemulihan tiap orang berbeda, dan sesi diatur mengikuti kesiapan klien.",
      "Praktiknya seluruhnya daring, yang membuatnya banyak menangani klien dari luar Yogyakarta. Untuk kasus yang butuh penanganan medis, ia merujuk ke psikiater.",
    ],
    approaches: [approaches.emdr, approaches.cbt, approaches.humanistik],
    education: [
      {
        id: "edu-3-1",
        degree: "S1 Psikologi",
        institution: "Universitas Gadjah Mada",
        year: 2015,
      },
      {
        id: "edu-3-2",
        degree: "Magister Psikologi Profesi, Klinis",
        institution: "Universitas Gadjah Mada",
        year: 2018,
      },
    ],
    services: [
      {
        id: "svc-3-1",
        slug: "konsultasi-individu",
        name: "Konsultasi Individu",
        mode: "Online",
        durationMinutes: 60,
        priceIdr: 320000,
      },
      {
        id: "svc-3-2",
        slug: "sesi-pemulihan-trauma",
        name: "Sesi Pemulihan Trauma",
        mode: "Online",
        durationMinutes: 90,
        priceIdr: 480000,
      },
    ],
    bookingUrl: "https://example.com/booking/chandra-wijaya",
  },
  {
    id: "prof-4",
    slug: "dian-puspitasari",
    fullName: "Dian Puspitasari",
    credentials: "S.Psi., Konselor",
    profession: "Konselor",
    photoUrl: null,
    isVerified: false,
    isAvailableNow: true,
    areasOfSupport: [areas.pengembanganDiri, areas.stres, areas.hubungan],
    sessionModes: ["Online"],
    location: { city: "Surabaya", province: "Jawa Timur" },
    languages: ["Indonesia"],
    yearsOfExperience: 4,
    startingPriceIdr: 195000,
    createdAt: "2026-02-11T02:00:00.000Z",
    headline:
      "Konselor untuk pengembangan diri, tekanan sehari-hari, dan hubungan dengan orang sekitar.",
    bio: [
      "Dian bekerja dengan orang yang merasa mandek — pada pekerjaan, pada hubungan, atau pada rencana yang tidak jalan-jalan. Sesinya banyak berisi percakapan terarah untuk menemukan langkah kecil yang bisa dijalankan minggu itu.",
      "Sebagai konselor, ia tidak melakukan diagnosis maupun psikoterapi klinis. Kalau dari percakapan terlihat ada keluhan yang butuh penanganan psikolog atau psikiater, ia mengatakannya dan membantu mencari rujukan.",
    ],
    approaches: [approaches.berfokusSolusi, approaches.humanistik],
    education: [
      {
        id: "edu-4-1",
        degree: "S1 Psikologi",
        institution: "Universitas Airlangga",
        year: 2021,
      },
    ],
    services: [
      {
        id: "svc-4-1",
        slug: "sesi-konseling",
        name: "Sesi Konseling",
        mode: "Online",
        durationMinutes: 50,
        priceIdr: 195000,
      },
      {
        id: "svc-4-2",
        slug: "konseling-pengembangan-diri",
        name: "Konseling Pengembangan Diri",
        mode: "Online",
        durationMinutes: 75,
        priceIdr: 275000,
      },
    ],
    bookingUrl: null,
  },
  {
    id: "prof-5",
    slug: "eka-nurhaliza",
    fullName: "Eka Nurhaliza",
    credentials: "M.Psi., Psikolog",
    profession: "Psikolog",
    photoUrl: null,
    isVerified: true,
    isAvailableNow: false,
    areasOfSupport: [areas.pengasuhan, areas.hubungan, areas.stres],
    sessionModes: ["Online", "In Person"],
    location: { city: "Jakarta Pusat", province: "DKI Jakarta" },
    languages: ["Indonesia", "English"],
    yearsOfExperience: 11,
    startingPriceIdr: 420000,
    createdAt: "2026-02-19T02:00:00.000Z",
    headline:
      "Psikolog klinis anak yang bekerja bersama orang tua, bukan hanya bersama anaknya.",
    bio: [
      "Eka menangani persoalan pengasuhan dan hubungan dalam keluarga, dari anak yang sulit diajak bicara sampai orang tua yang kehabisan tenaga. Sesi kerap melibatkan kedua orang tua sekaligus, karena kesepakatan di antara mereka biasanya menentukan hasilnya.",
      "Ia membuka sesi daring maupun tatap muka, tapi untuk penanganan yang melibatkan anak langsung ia menyarankan tatap muka.",
    ],
    approaches: [approaches.keluarga, approaches.cbt, approaches.humanistik],
    education: [
      {
        id: "edu-5-1",
        degree: "S1 Psikologi",
        institution: "Universitas Padjadjaran",
        year: 2010,
      },
      {
        id: "edu-5-2",
        degree: "Magister Psikologi Profesi, Klinis Anak",
        institution: "Universitas Indonesia",
        year: 2014,
      },
    ],
    services: [
      {
        id: "svc-5-1",
        slug: "konsultasi-individu",
        name: "Konsultasi Individu",
        mode: "Online",
        durationMinutes: 60,
        priceIdr: 420000,
      },
      {
        id: "svc-5-2",
        slug: "konsultasi-pengasuhan",
        name: "Konsultasi Pengasuhan",
        mode: "Online",
        durationMinutes: 60,
        priceIdr: 450000,
      },
      {
        id: "svc-5-3",
        slug: "konseling-keluarga",
        name: "Konseling Keluarga",
        mode: "In Person",
        durationMinutes: 90,
        priceIdr: 720000,
      },
    ],
    bookingUrl: "https://example.com/booking/eka-nurhaliza",
  },
  {
    id: "prof-6",
    slug: "fajar-ramadhan",
    fullName: "Fajar Ramadhan",
    credentials: "dr., Sp.KJ",
    profession: "Psikiater",
    photoUrl: null,
    isVerified: true,
    isAvailableNow: true,
    areasOfSupport: [areas.depresi, areas.burnout, areas.polaTidur],
    sessionModes: ["Online", "In Person"],
    location: { city: "Medan", province: "Sumatera Utara" },
    languages: ["Indonesia"],
    yearsOfExperience: 16,
    startingPriceIdr: 600000,
    createdAt: "2026-03-02T02:00:00.000Z",
    headline:
      "Psikiater yang banyak menangani depresi, kelelahan kerja berat, dan gangguan tidur.",
    bio: [
      "Fajar menangani depresi, kelelahan kerja yang sudah mengganggu fungsi sehari-hari, dan gangguan tidur. Ia menaruh perhatian khusus pada klien yang sudah lama mengonsumsi obat tanpa evaluasi ulang.",
      "Sesi daring ia buka untuk kontrol dan konsultasi lanjutan, sementara pemeriksaan awal dan asesmen tidur ia lakukan tatap muka.",
    ],
    approaches: [
      approaches.farmakoterapi,
      approaches.cbt,
      approaches.mindfulness,
    ],
    education: [
      {
        id: "edu-6-1",
        degree: "Pendidikan Dokter",
        institution: "Universitas Sumatera Utara",
        year: 2006,
      },
      {
        id: "edu-6-2",
        degree: "Spesialis Kedokteran Jiwa",
        institution: "Universitas Sumatera Utara",
        year: 2013,
      },
    ],
    services: [
      {
        id: "svc-6-1",
        slug: "konsultasi-psikiatri-online",
        name: "Konsultasi Psikiatri",
        mode: "Online",
        durationMinutes: 40,
        priceIdr: 600000,
      },
      {
        id: "svc-6-2",
        slug: "konsultasi-psikiatri-tatap-muka",
        name: "Konsultasi Psikiatri",
        mode: "In Person",
        durationMinutes: 45,
        priceIdr: 650000,
      },
      {
        id: "svc-6-3",
        slug: "asesmen-gangguan-tidur",
        name: "Asesmen Gangguan Tidur",
        mode: "In Person",
        durationMinutes: 90,
        priceIdr: 950000,
      },
    ],
    bookingUrl: "https://example.com/booking/fajar-ramadhan",
  },
  {
    id: "prof-7",
    slug: "gita-maheswari",
    fullName: "Gita Maheswari",
    credentials: "M.Psi., Psikolog",
    profession: "Psikolog",
    photoUrl: null,
    isVerified: false,
    isAvailableNow: true,
    areasOfSupport: [areas.kecemasan, areas.pengembanganDiri],
    sessionModes: ["Online"],
    location: { city: "Denpasar", province: "Bali" },
    languages: ["Indonesia", "English"],
    yearsOfExperience: 5,
    startingPriceIdr: 275000,
    createdAt: "2026-03-15T02:00:00.000Z",
    headline:
      "Psikolog klinis untuk kecemasan dan orang yang sedang menata ulang arah hidupnya.",
    bio: [
      "Gita bekerja dengan klien yang cemas berlebihan dan dengan mereka yang sedang berada di persimpangan — pindah kerja, pindah kota, atau keluar dari rutinitas yang sudah tidak cocok. Sesinya banyak memakai latihan penerimaan sebelum masuk ke penyusunan langkah.",
      "Seluruh praktiknya daring dan terbuka untuk sesi berbahasa Inggris.",
    ],
    approaches: [approaches.act, approaches.mindfulness],
    education: [
      {
        id: "edu-7-1",
        degree: "S1 Psikologi",
        institution: "Universitas Udayana",
        year: 2017,
      },
      {
        id: "edu-7-2",
        degree: "Magister Psikologi Profesi, Klinis",
        institution: "Universitas Gadjah Mada",
        year: 2020,
      },
    ],
    services: [
      {
        id: "svc-7-1",
        slug: "konsultasi-individu",
        name: "Konsultasi Individu",
        mode: "Online",
        durationMinutes: 60,
        priceIdr: 275000,
      },
      {
        id: "svc-7-2",
        slug: "sesi-mindfulness-terpandu",
        name: "Sesi Mindfulness Terpandu",
        mode: "Online",
        durationMinutes: 45,
        priceIdr: 300000,
      },
    ],
    bookingUrl: null,
  },
  {
    id: "prof-8",
    slug: "hendra-saputra",
    fullName: "Hendra Saputra",
    credentials: "S.Psi., Konselor",
    profession: "Konselor",
    photoUrl: null,
    isVerified: false,
    isAvailableNow: false,
    areasOfSupport: [areas.burnout, areas.stres, areas.pengembanganDiri],
    sessionModes: ["Online", "In Person"],
    location: { city: "Semarang", province: "Jawa Tengah" },
    languages: ["Indonesia"],
    yearsOfExperience: 6,
    startingPriceIdr: 210000,
    createdAt: "2026-03-27T02:00:00.000Z",
    headline:
      "Konselor yang banyak menangani kelelahan kerja dan pilihan karier yang terasa buntu.",
    bio: [
      "Hendra mendampingi pekerja yang kelelahan dan mulai kehilangan minat pada pekerjaannya. Sesi dipakai untuk memilah mana yang bisa diubah dari cara bekerja dan mana yang memang di luar kendali klien.",
      "Sebagai konselor ia tidak melakukan diagnosis. Untuk keluhan yang menetap dan mengganggu fungsi sehari-hari, ia menyarankan pemeriksaan ke psikolog klinis atau psikiater.",
    ],
    approaches: [approaches.berfokusSolusi, approaches.cbt],
    education: [
      {
        id: "edu-8-1",
        degree: "S1 Psikologi",
        institution: "Universitas Diponegoro",
        year: 2019,
      },
    ],
    services: [
      {
        id: "svc-8-1",
        slug: "sesi-konseling-online",
        name: "Sesi Konseling",
        mode: "Online",
        durationMinutes: 50,
        priceIdr: 210000,
      },
      {
        id: "svc-8-2",
        slug: "sesi-konseling-tatap-muka",
        name: "Sesi Konseling",
        mode: "In Person",
        durationMinutes: 50,
        priceIdr: 260000,
      },
      {
        id: "svc-8-3",
        slug: "konseling-karier",
        name: "Konseling Karier dan Burnout",
        mode: "Online",
        durationMinutes: 75,
        priceIdr: 320000,
      },
    ],
    bookingUrl: null,
  },
  {
    id: "prof-9",
    slug: "intan-larasati",
    fullName: "Intan Larasati",
    credentials: "M.Psi., Psikolog",
    profession: "Psikolog",
    photoUrl: null,
    isVerified: true,
    isAvailableNow: true,
    areasOfSupport: [areas.trauma, areas.hubungan, areas.depresi, areas.stres],
    sessionModes: ["In Person"],
    location: { city: "Makassar", province: "Sulawesi Selatan" },
    languages: ["Indonesia"],
    yearsOfExperience: 12,
    startingPriceIdr: 450000,
    createdAt: "2026-04-08T02:00:00.000Z",
    headline:
      "Psikolog klinis dengan pengalaman panjang pada trauma dan persoalan hubungan.",
    bio: [
      "Intan menangani trauma, persoalan hubungan, dan depresi pada klien dewasa. Sebagian besar kliennya datang setelah mencoba menyelesaikan sendiri dalam waktu lama, jadi sesi awal biasanya berjalan lambat dengan sengaja.",
      "Praktiknya tatap muka saja, karena ia menilai penanganan trauma menuntut ruang yang terkendali dan kehadiran langsung.",
    ],
    approaches: [approaches.emdr, approaches.psikodinamik, approaches.cbt],
    education: [
      {
        id: "edu-9-1",
        degree: "S1 Psikologi",
        institution: "Universitas Hasanuddin",
        year: 2009,
      },
      {
        id: "edu-9-2",
        degree: "Magister Psikologi Profesi, Klinis Dewasa",
        institution: "Universitas Indonesia",
        year: 2013,
      },
    ],
    services: [
      {
        id: "svc-9-1",
        slug: "konsultasi-individu",
        name: "Konsultasi Individu",
        mode: "In Person",
        durationMinutes: 60,
        priceIdr: 450000,
      },
      {
        id: "svc-9-2",
        slug: "sesi-pemulihan-trauma",
        name: "Sesi Pemulihan Trauma",
        mode: "In Person",
        durationMinutes: 90,
        priceIdr: 700000,
      },
    ],
    bookingUrl: "https://example.com/booking/intan-larasati",
  },
];

export async function getProfessionals(): Promise<Professional[]> {
  return professionals;
}

export async function getProfessionalBySlug(
  slug: string,
): Promise<Professional | null> {
  return professionals.find((item) => item.slug === slug) ?? null;
}

/**
 * Profesional lain untuk ditawarkan di bawah halaman detail.
 *
 * Urutan pencariannya: kota yang sama lebih dulu, lalu profesi yang sama, lalu
 * siapa pun — supaya blok ini tidak pernah kosong dan halaman detail tidak
 * berakhir sebagai jalan buntu. Profesional yang sedang dibuka selalu dikeluarkan.
 */
export async function getRelatedProfessionals(
  slug: string,
  limit = 3,
): Promise<Professional[]> {
  const current = professionals.find((item) => item.slug === slug);
  if (!current) return [];

  const others = professionals.filter((item) => item.slug !== slug);
  const sameCity = others.filter(
    (item) => item.location.city === current.location.city,
  );
  const sameProfession = others.filter(
    (item) =>
      item.profession === current.profession &&
      item.location.city !== current.location.city,
  );

  const ordered = [...sameCity, ...sameProfession, ...others];
  const unique = ordered.filter(
    (item, index) => ordered.findIndex((one) => one.id === item.id) === index,
  );

  return unique.slice(0, limit);
}

export async function getProfessionalFacets(): Promise<ProfessionalFacets> {
  const professions = new Set<ProfessionKind>();
  const sessionModes = new Set<SessionMode>();
  const cities = new Set<string>();
  const areaBySlug = new Map<string, AreaOfSupport>();

  for (const item of professionals) {
    professions.add(item.profession);
    item.sessionModes.forEach((mode) => sessionModes.add(mode));
    cities.add(item.location.city);
    item.areasOfSupport.forEach((area) => areaBySlug.set(area.slug, area));
  }

  return {
    professions: [...professions].sort((a, b) => a.localeCompare(b)),
    sessionModes: [...sessionModes].sort((a, b) => a.localeCompare(b)),
    cities: [...cities].sort((a, b) => a.localeCompare(b, "id-ID")),
    areasOfSupport: [...areaBySlug.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "id-ID"),
    ),
  };
}
