// PERINGATAN: LIMA BELAS PROFIL DI FILE INI FIKTIF.
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
//
// `prof-10` sampai `prof-15` ditambahkan 24 Agustus 2026 supaya ada kota yang
// berisi lebih dari satu orang — tanpa itu relasi centre ↔ profesional selalu
// satu-satu. Alasan lengkap dan cara mengembalikannya ada di `design.md`
// bagian 20.

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
    verification: {
      review: "approved",
      checkedOn: "2026-02-11",
      validUntil: "2028-02-10",
      source: "submission",
    },
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
    verification: {
      review: "approved",
      checkedOn: "2026-01-19",
      validUntil: "2027-11-30",
      source: "submission",
    },
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
    verification: {
      review: "approved",
      checkedOn: "2026-04-06",
      validUntil: "2029-03-31",
      source: "submission",
    },
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
    verification: {
      review: "pending",
      checkedOn: null,
      validUntil: null,
      source: null,
    },
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
    verification: {
      review: "approved",
      checkedOn: "2025-12-08",
      validUntil: "2027-06-30",
      source: "submission",
    },
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
    verification: {
      review: "approved",
      checkedOn: "2026-03-23",
      validUntil: "2028-09-30",
      source: "submission",
    },
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
    verification: {
      review: "none",
      checkedOn: null,
      validUntil: null,
      source: null,
    },
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
    verification: {
      review: "approved",
      checkedOn: "2024-07-15",
      validUntil: "2026-05-31",
      source: "submission",
    },
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
    verification: {
      review: "approved",
      checkedOn: "2026-05-04",
      validUntil: "2028-04-30",
      source: "submission",
    },
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
  {
    id: "prof-10",
    slug: "jelita-anggraini",
    fullName: "Jelita Anggraini",
    credentials: "M.Psi., Psikolog",
    profession: "Psikolog",
    photoUrl: null,
    verification: {
      review: "approved",
      checkedOn: "2026-02-27",
      validUntil: "2027-12-31",
      source: "submission",
    },
    isAvailableNow: true,
    areasOfSupport: [areas.pengasuhan, areas.hubungan, areas.pengembanganDiri],
    sessionModes: ["Online", "In Person"],
    location: { city: "Jakarta Selatan", province: "DKI Jakarta" },
    languages: ["Indonesia", "English"],
    yearsOfExperience: 8,
    startingPriceIdr: 350000,
    createdAt: "2026-04-20T02:00:00.000Z",
    headline:
      "Psikolog yang mendampingi orang tua dan remaja membicarakan hal yang biasanya dihindari di rumah.",
    bio: [
      "Jelita banyak bekerja dengan keluarga yang percakapannya sudah lama berhenti — orang tua yang merasa tidak lagi dibutuhkan, remaja yang merasa tidak pernah didengar. Sesi awal biasanya dipakai untuk mendengar kedua sisi secara terpisah sebelum mempertemukannya.",
      "Ia terbiasa bekerja daring untuk sesi bersama orang tua, dan menyarankan tatap muka kalau anak atau remajanya ikut hadir, karena banyak hal yang lebih mudah terbaca dari cara orang duduk daripada dari layar.",
    ],
    approaches: [approaches.keluarga, approaches.humanistik, approaches.cbt],
    education: [
      {
        id: "edu-10-1",
        degree: "S1 Psikologi",
        institution: "Universitas Gadjah Mada",
        year: 2014,
      },
      {
        id: "edu-10-2",
        degree: "Magister Psikologi Profesi, Klinis Anak",
        institution: "Universitas Indonesia",
        year: 2018,
      },
    ],
    services: [
      {
        id: "svc-10-1",
        slug: "konsultasi-individu",
        name: "Konsultasi Individu",
        mode: "Online",
        durationMinutes: 60,
        priceIdr: 350000,
      },
      {
        id: "svc-10-2",
        slug: "konsultasi-pengasuhan",
        name: "Konsultasi Pengasuhan",
        mode: "In Person",
        durationMinutes: 75,
        priceIdr: 480000,
      },
    ],
    bookingUrl: "https://example.com/booking/jelita-anggraini",
  },
  {
    id: "prof-11",
    slug: "kurniawan-adiputra",
    fullName: "Kurniawan Adiputra",
    credentials: "dr., Sp.KJ",
    profession: "Psikiater",
    photoUrl: null,
    verification: {
      review: "approved",
      checkedOn: "2026-06-15",
      validUntil: "2029-06-14",
      source: "submission",
    },
    isAvailableNow: false,
    areasOfSupport: [areas.depresi, areas.polaTidur, areas.kecemasan],
    sessionModes: ["Online", "In Person"],
    location: { city: "Surabaya", province: "Jawa Timur" },
    languages: ["Indonesia"],
    yearsOfExperience: 13,
    startingPriceIdr: 520000,
    createdAt: "2026-04-29T02:00:00.000Z",
    headline:
      "Psikiater yang menangani depresi dan keluhan tidur yang sudah berlangsung bertahun-tahun.",
    bio: [
      "Kurniawan menerima orang yang keluhannya sudah lama dibawa sendiri — sulit tidur yang berubah jadi sulit bekerja, suasana hati yang turun dan tidak pulih-pulih. Pemeriksaan awalnya memakan waktu lebih panjang dari sesi biasa karena ia menelusuri riwayatnya dulu.",
      "Sebagai psikiater ia dapat meresepkan obat, tapi tidak setiap orang yang datang keluar dengan resep. Untuk yang juga menjalani psikoterapi, ia berkoordinasi dengan psikolog atau konselor yang menangani supaya keduanya tidak berjalan sendiri-sendiri.",
    ],
    approaches: [
      approaches.farmakoterapi,
      approaches.cbt,
      approaches.mindfulness,
    ],
    education: [
      {
        id: "edu-11-1",
        degree: "Pendidikan Dokter",
        institution: "Universitas Airlangga",
        year: 2009,
      },
      {
        id: "edu-11-2",
        degree: "Spesialis Kedokteran Jiwa",
        institution: "Universitas Airlangga",
        year: 2016,
      },
    ],
    services: [
      {
        id: "svc-11-1",
        slug: "konsultasi-psikiatri",
        name: "Konsultasi Psikiatri",
        mode: "Online",
        durationMinutes: 45,
        priceIdr: 520000,
      },
      {
        id: "svc-11-2",
        slug: "konsultasi-dan-asesmen",
        name: "Konsultasi dan Asesmen Lengkap",
        mode: "In Person",
        durationMinutes: 90,
        priceIdr: 800000,
      },
    ],
    bookingUrl: "https://example.com/booking/kurniawan-adiputra",
  },
  {
    id: "prof-12",
    slug: "laila-fitriani",
    fullName: "Laila Fitriani",
    credentials: "S.Psi., Konselor",
    profession: "Konselor",
    photoUrl: null,
    verification: {
      review: "rejected",
      checkedOn: "2026-07-02",
      validUntil: null,
      source: "submission",
    },
    isAvailableNow: true,
    areasOfSupport: [areas.stres, areas.burnout, areas.hubungan],
    sessionModes: ["Online"],
    location: { city: "Surabaya", province: "Jawa Timur" },
    languages: ["Indonesia"],
    yearsOfExperience: 3,
    startingPriceIdr: 175000,
    createdAt: "2026-05-11T02:00:00.000Z",
    headline:
      "Konselor untuk tekanan kerja yang menumpuk dan hubungan dengan rekan yang mulai terasa berat.",
    bio: [
      "Laila bekerja dengan orang yang pekerjaannya masih jalan tapi tenaganya sudah habis — masih menyelesaikan tugas, tapi tidak ingat lagi kapan terakhir merasa cukup. Sesinya berisi percakapan terarah untuk memisahkan mana yang bisa diubah dari mana yang harus diterima dulu.",
      "Ia tidak melakukan diagnosis maupun psikoterapi klinis. Kalau dari percakapan terlihat keluhannya sudah melampaui kelelahan biasa, ia mengatakannya terus terang dan membantu mencari psikolog atau psikiater.",
    ],
    approaches: [approaches.berfokusSolusi, approaches.humanistik],
    education: [
      {
        id: "edu-12-1",
        degree: "S1 Psikologi",
        institution: "Universitas Negeri Surabaya",
        year: 2022,
      },
    ],
    services: [
      {
        id: "svc-12-1",
        slug: "sesi-konseling",
        name: "Sesi Konseling",
        mode: "Online",
        durationMinutes: 50,
        priceIdr: 175000,
      },
      {
        id: "svc-12-2",
        slug: "konseling-tekanan-kerja",
        name: "Konseling Tekanan Kerja",
        mode: "Online",
        durationMinutes: 90,
        priceIdr: 300000,
      },
    ],
    bookingUrl: null,
  },
  {
    id: "prof-13",
    slug: "mahesa-pratama",
    fullName: "Mahesa Pratama",
    credentials: "M.Psi., Psikolog",
    profession: "Psikolog",
    photoUrl: null,
    verification: {
      review: "approved",
      checkedOn: "2026-01-08",
      validUntil: "2027-08-31",
      source: "submission",
    },
    isAvailableNow: true,
    areasOfSupport: [areas.trauma, areas.dukaCita, areas.depresi],
    sessionModes: ["Online", "In Person"],
    location: { city: "Semarang", province: "Jawa Tengah" },
    languages: ["Indonesia"],
    yearsOfExperience: 10,
    startingPriceIdr: 400000,
    createdAt: "2026-05-25T02:00:00.000Z",
    headline:
      "Psikolog klinis yang bekerja dengan kejadian berat dan kehilangan yang belum selesai diproses.",
    bio: [
      "Mahesa menangani orang yang membawa satu kejadian yang tidak mau lewat — kecelakaan, kehilangan, atau masa yang lebih baik tidak diingat. Ia bekerja dengan tempo yang ditentukan kliennya, karena membuka terlalu cepat justru membuat orang berhenti datang.",
      "Untuk penanganan trauma ia menyarankan tatap muka, terutama pada sesi-sesi awal. Sesi daring ia pakai untuk tindak lanjut dan untuk klien yang sudah stabil tapi jaraknya jauh.",
    ],
    approaches: [approaches.emdr, approaches.cbt, approaches.psikodinamik],
    education: [
      {
        id: "edu-13-1",
        degree: "S1 Psikologi",
        institution: "Universitas Diponegoro",
        year: 2012,
      },
      {
        id: "edu-13-2",
        degree: "Magister Psikologi Profesi, Klinis Dewasa",
        institution: "Universitas Gadjah Mada",
        year: 2016,
      },
    ],
    services: [
      {
        id: "svc-13-1",
        slug: "konsultasi-individu-online",
        name: "Konsultasi Individu",
        mode: "Online",
        durationMinutes: 60,
        priceIdr: 400000,
      },
      {
        id: "svc-13-2",
        slug: "konsultasi-individu-tatap-muka",
        name: "Konsultasi Individu",
        mode: "In Person",
        durationMinutes: 60,
        priceIdr: 475000,
      },
      {
        id: "svc-13-3",
        slug: "sesi-pemulihan-trauma",
        name: "Sesi Pemulihan Trauma",
        mode: "In Person",
        durationMinutes: 90,
        priceIdr: 700000,
      },
    ],
    bookingUrl: "https://example.com/booking/mahesa-pratama",
  },
  {
    id: "prof-14",
    slug: "nadia-kusumawardani",
    fullName: "Nadia Kusumawardani",
    credentials: "S.Psi., Konselor",
    profession: "Konselor",
    photoUrl: null,
    verification: {
      review: "none",
      checkedOn: null,
      validUntil: null,
      source: null,
    },
    isAvailableNow: true,
    areasOfSupport: [areas.kecemasan, areas.stres, areas.pengasuhan],
    sessionModes: ["Online", "In Person"],
    location: { city: "Jakarta Pusat", province: "DKI Jakarta" },
    languages: ["Indonesia"],
    yearsOfExperience: 5,
    startingPriceIdr: 150000,
    createdAt: "2026-06-08T02:00:00.000Z",
    headline:
      "Konselor dengan tarif terjangkau untuk kecemasan sehari-hari dan urusan pengasuhan.",
    bio: [
      "Nadia menerima orang yang baru pertama kali mencari bantuan dan belum yakin apakah keluhannya cukup berat untuk dibicarakan. Sesi pertamanya sering habis hanya untuk itu, dan menurutnya itu bukan sesi yang terbuang.",
      "Ia tidak melakukan diagnosis maupun psikoterapi klinis. Tarifnya ia jaga tetap rendah supaya orang tidak menunggu sampai keadaannya memburuk baru datang, dan ia menyebutkan sejak awal kalau suatu keluhan sebaiknya ditangani psikolog atau psikiater.",
    ],
    approaches: [approaches.berfokusSolusi, approaches.humanistik],
    education: [
      {
        id: "edu-14-1",
        degree: "S1 Psikologi",
        institution: "Universitas Negeri Jakarta",
        year: 2019,
      },
    ],
    services: [
      {
        id: "svc-14-1",
        slug: "sesi-konseling-online",
        name: "Sesi Konseling",
        mode: "Online",
        durationMinutes: 50,
        priceIdr: 150000,
      },
      {
        id: "svc-14-2",
        slug: "sesi-konseling-tatap-muka",
        name: "Sesi Konseling",
        mode: "In Person",
        durationMinutes: 50,
        priceIdr: 185000,
      },
    ],
    bookingUrl: null,
  },
  {
    id: "prof-15",
    slug: "oktavia-rahayu",
    fullName: "Oktavia Rahayu",
    credentials: "S.Psi., Konselor",
    profession: "Konselor",
    photoUrl: null,
    verification: {
      review: "revoked",
      checkedOn: "2026-06-30",
      validUntil: null,
      source: "submission",
    },
    isAvailableNow: false,
    areasOfSupport: [areas.pengembanganDiri, areas.stres, areas.hubungan],
    sessionModes: ["Online", "In Person"],
    location: { city: "Bandung", province: "Jawa Barat" },
    languages: ["Indonesia", "English"],
    yearsOfExperience: 6,
    startingPriceIdr: 185000,
    createdAt: "2026-06-22T02:00:00.000Z",
    headline:
      "Konselor untuk orang yang sedang menimbang perubahan besar dan pasangan yang ingin bicara lebih tenang.",
    bio: [
      "Oktavia banyak menemani orang yang sedang di persimpangan: pindah kerja, pindah kota, atau memutuskan hubungan yang sudah lama tidak nyaman. Ia tidak memberi jawaban, tapi membantu memisahkan mana yang benar-benar keinginan sendiri dan mana yang tekanan orang lain.",
      "Untuk sesi pasangan ia hanya menerima tatap muka, karena dua orang yang sedang berselisih jarang bisa saling mendengar lewat satu layar. Sesi perorangan bisa daring.",
    ],
    approaches: [approaches.berfokusSolusi, approaches.humanistik],
    education: [
      {
        id: "edu-15-1",
        degree: "S1 Psikologi",
        institution: "Universitas Padjadjaran",
        year: 2018,
      },
    ],
    services: [
      {
        id: "svc-15-1",
        slug: "sesi-konseling",
        name: "Sesi Konseling",
        mode: "Online",
        durationMinutes: 50,
        priceIdr: 185000,
      },
      {
        id: "svc-15-2",
        slug: "konseling-pasangan",
        name: "Konseling Pasangan",
        mode: "In Person",
        durationMinutes: 90,
        priceIdr: 400000,
      },
    ],
    bookingUrl: "https://example.com/booking/oktavia-rahayu",
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
