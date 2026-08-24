// PERINGATAN: SELURUH ISI SEMBILAN SOLUSI DI FILE INI FIKTIF.
//
// Nama program, uraiannya, daftar pertemuan, dan harganya semuanya karangan.
// Tidak ada satu pun program di bawah ini yang benar-benar ditawarkan siapa pun.
// Wajib diganti data asli sebelum pernah tayang publik — program kesehatan
// mental karangan bisa dianggap tawaran sungguhan oleh orang yang sedang
// mencari bantuan, dan harga karangan bisa dianggap komitmen harga.
//
// Karena itu isi di bawah ditulis dengan tiga pantangan yang HARUS dipertahankan
// selama datanya masih karangan — sama seperti di `insights/data/articles.ts`:
// tidak ada angka statistik, tidak ada rujukan penelitian, dan tidak ada nama
// obat maupun dosis.
//
// Catatan nilai turunan (jangan diubah sepihak, ada harness yang menjaganya —
// `scripts/check-data-invariants.mjs`):
//
// 1. `curriculum.length` WAJIB sama dengan `sessionCount`. Daftar pertemuan itu
//    rincian dari angka yang sama, bukan data lain. Kalau tidak dijaga, halaman
//    detail bisa bilang "12 sessions" sambil memperlihatkan lima baris.
// 2. `priceIdr` boleh `null`, dan `null` BERARTI SESUATU: tombolnya berubah jadi
//    "Contact us". Dipakai untuk program yang di dunia nyata dinegosiasi per
//    klien (workplaces dan sebagian communities). Angka wajib bulat ribuan.
// 3. Untuk kategori `individuals` yang berharga, `priceIdr` tidak boleh melebihi
//    `sessionCount x startingPriceIdr` milik `leadProfessionalSlug`. Paket yang
//    lebih mahal daripada membeli sesi satu-satu itu bug, bukan pilihan harga.
//    Batas ini SENGAJA hanya untuk `individuals`: program workplace dihitung per
//    perusahaan dan program kelompok dihitung per peserta, jadi perbandingannya
//    tidak berlaku di sana.
// 4. `leadProfessionalSlug` wajib ada di `professionals/data/professionals.ts`
//    atau `null`. Salah tulis satu huruf = tautan 404 yang bisa diklik.
//
// Urutan array `solutions` SENGAJA diacak per kategori — jangan disortir. Kalau
// digrup per kategori, baris pertama di halaman daftar jadi tiga tombol ungu
// semua (lihat `design.md` bagian 11).

import type {
  Solution,
  SolutionCategory,
  SolutionFocusArea,
  SolutionPartner,
} from "../type/solution";

const categories = {
  individuals: {
    id: "solcat-1",
    slug: "individuals",
    name: "For Individuals",
    theme: "purple",
  },
  workplaces: {
    id: "solcat-2",
    slug: "workplaces",
    name: "For Workplaces",
    theme: "navy",
  },
  communities: {
    id: "solcat-3",
    slug: "communities",
    name: "For Communities",
    theme: "emerald",
  },
} satisfies Record<string, SolutionCategory>;
const focusAreas = {
  kecemasan: { id: "solfocus-1", slug: "kecemasan", name: "Kecemasan" },
  stres: { id: "solfocus-2", slug: "stres", name: "Stres" },
  burnout: { id: "solfocus-3", slug: "burnout", name: "Burnout" },
  trauma: { id: "solfocus-4", slug: "trauma", name: "Trauma" },
  hubungan: { id: "solfocus-5", slug: "hubungan", name: "Hubungan" },
  pengembanganDiri: {
    id: "solfocus-6",
    slug: "pengembangan-diri",
    name: "Pengembangan Diri",
  },
  polaTidur: { id: "solfocus-7", slug: "pola-tidur", name: "Pola Tidur" },
  pengasuhan: { id: "solfocus-8", slug: "pengasuhan", name: "Pengasuhan" },
  dukaCita: { id: "solfocus-9", slug: "duka-cita", name: "Duka Cita" },
} satisfies Record<string, SolutionFocusArea>;

const partners = {
  atmaConnect: {
    id: "solpartner-1",
    slug: "atma-connect",
    name: "Atma Connect",
    logoUrl: null,
  },
  halodoc: {
    id: "solpartner-2",
    slug: "halodoc",
    name: "Halodoc",
    logoUrl: null,
  },
  mhfa: {
    id: "solpartner-3",
    slug: "mhfa",
    name: "MHFA",
    logoUrl: null,
  },
} satisfies Record<string, SolutionPartner>;
const solutions: Solution[] = [
  {
    id: "sol-1",
    slug: "konseling-individu-daring",
    title: "Konseling Individu Daring",
    summary:
      "Sesi satu lawan satu dengan psikolog dari direktori, dijadwalkan sesuai waktu yang kamu pilih.",
    coverImageUrl: null,
    category: categories.individuals,
    focusAreas: [focusAreas.kecemasan, focusAreas.stres],
    deliveryModes: ["Online"],
    sessionCount: 4,
    sessionMinutes: 60,
    priceIdr: 1400000,
    overview: [
      "Empat sesi daring dengan satu psikolog yang sama dari awal sampai akhir. Jadwalnya kamu pilih sendiri, dan seluruh percakapan berlangsung lewat panggilan video tanpa perlu datang ke tempat praktik.",
      "Rangkaian ini dirancang untuk keluhan yang sudah terasa mengganggu tapi belum sampai membuat kegiatan sehari-hari berhenti. Kalau di sesi pertama ternyata keluhannya butuh penanganan lebih panjang, psikolognya akan mengatakan itu terus terang dan membantu menimbang langkah berikutnya.",
    ],
    whoItIsFor: [
      "Sedang merasa cemas atau tertekan dan ingin membicarakannya dengan orang yang terlatih",
      "Lebih nyaman bercerita dari rumah daripada datang ke tempat praktik",
      "Butuh jadwal yang bisa menyesuaikan jam kerja atau jam kuliah",
      "Belum pernah ke psikolog dan ingin mencoba dulu sebelum memutuskan lanjut",
    ],
    curriculum: [
      {
        id: "sol-1-s1",
        title: "Sesi Pertama: Mengenali Keluhan",
        summary:
          "Menceritakan apa yang sedang terjadi, lalu menyusun gambaran awal bersama psikolog.",
      },
      {
        id: "sol-1-s2",
        title: "Menandai Pemicu Harian",
        summary:
          "Melihat situasi apa yang paling sering menyalakan kecemasan, lalu mencatatnya selama seminggu.",
      },
      {
        id: "sol-1-s3",
        title: "Melatih Cara Menenangkan Diri",
        summary:
          "Mencoba beberapa cara meredakan gejolak, lalu memilih yang paling cocok untuk dipakai sendiri.",
      },
      {
        id: "sol-1-s4",
        title: "Menyusun Rencana Lanjutan",
        summary:
          "Meninjau perubahan yang terasa dan memutuskan apakah perlu sesi tambahan.",
      },
    ],
    leadProfessionalSlug: "anindita-rahmawati",
    partners: [partners.halodoc],
    createdAt: "2026-05-04T02:00:00.000Z",
  },
  {
    id: "sol-2",
    slug: "program-kesehatan-mental-karyawan",
    title: "Program Kesehatan Mental Karyawan",
    summary:
      "Paket tahunan untuk perusahaan: kuota konseling, sesi edukasi bulanan, dan laporan agregat tanpa data pribadi.",
    coverImageUrl: null,
    category: categories.workplaces,
    focusAreas: [focusAreas.burnout, focusAreas.stres],
    deliveryModes: ["Online", "In Person"],
    sessionCount: 12,
    sessionMinutes: 90,
    priceIdr: null,
    overview: [
      "Program setahun untuk satu perusahaan: dua belas pertemuan bulanan untuk seluruh karyawan, ditambah kuota konseling pribadi yang bisa dipakai siapa pun tanpa perlu izin atasan.",
      "Laporan ke perusahaan hanya berbentuk angka agregat — berapa banyak kuota terpakai dan tema apa yang paling sering muncul. Siapa yang datang dan apa yang diceritakan tidak pernah sampai ke manajemen, dan kesepakatan itu dibacakan di pertemuan pertama supaya semua orang mendengarnya langsung.",
    ],
    whoItIsFor: [
      "Perusahaan yang mulai melihat tanda kelelahan menumpuk di beberapa tim",
      "Tim HR yang butuh jalur rujukan jelas ketika ada karyawan datang bercerita",
      "Perusahaan yang ingin program berjalan setahun, bukan satu sesi lalu selesai",
    ],
    curriculum: [
      {
        id: "sol-2-s1",
        title: "Peluncuran Program dan Kesepakatan Kerahasiaan",
        summary:
          "Menjelaskan cara memakai kuota konseling dan apa saja yang tidak akan pernah dilaporkan ke manajemen.",
      },
      {
        id: "sol-2-s2",
        title: "Mengenali Beban Kerja yang Mulai Menumpuk",
        summary:
          "Membedakan sibuk yang wajar dari sibuk yang sudah menggerus tenaga.",
      },
      {
        id: "sol-2-s3",
        title: "Batas Sehat antara Pekerjaan dan Waktu Pribadi",
        summary:
          "Menyusun batas yang bisa dijalankan di tempat kerja masing-masing, bukan batas ideal di atas kertas.",
      },
      {
        id: "sol-2-s4",
        title: "Percakapan Sulit dengan Atasan",
        summary:
          "Melatih cara menyampaikan beban yang berlebih tanpa terdengar menolak pekerjaan.",
      },
      {
        id: "sol-2-s5",
        title: "Istirahat yang Benar-benar Memulihkan",
        summary:
          "Melihat kenapa akhir pekan sering terasa tidak cukup, dan apa yang bisa diubah.",
      },
      {
        id: "sol-2-s6",
        title: "Menemani Rekan yang Sedang Berat",
        summary:
          "Apa yang bisa dilakukan rekan kerja, dan yang lebih penting, apa yang sebaiknya tidak.",
      },
      {
        id: "sol-2-s7",
        title: "Tinjauan Tengah Tahun",
        summary:
          "Membahas pemakaian kuota sejauh ini dan menyesuaikan tema enam pertemuan berikutnya.",
      },
      {
        id: "sol-2-s8",
        title: "Mengelola Tenggat yang Bertumpuk",
        summary:
          "Cara menata urutan pekerjaan ketika semuanya terasa mendesak sekaligus.",
      },
      {
        id: "sol-2-s9",
        title: "Kembali Bekerja setelah Cuti Panjang",
        summary:
          "Menyiapkan kembalinya karyawan setelah cuti sakit, cuti melahirkan, atau kehilangan keluarga.",
      },
      {
        id: "sol-2-s10",
        title: "Konflik di Dalam Tim",
        summary:
          "Membedakan perbedaan pendapat yang sehat dari gesekan yang mulai melelahkan semua orang.",
      },
      {
        id: "sol-2-s11",
        title: "Menjaga Semangat di Musim Sibuk",
        summary:
          "Menyiapkan tim menghadapi periode padat yang sudah bisa diperkirakan.",
      },
      {
        id: "sol-2-s12",
        title: "Penutup dan Laporan Agregat",
        summary:
          "Menyerahkan laporan angka setahun dan menimbang bentuk program tahun berikutnya.",
      },
    ],
    leadProfessionalSlug: "hendra-saputra",
    partners: [partners.halodoc, partners.atmaConnect],
    createdAt: "2026-05-06T02:00:00.000Z",
  },
  {
    id: "sol-3",
    slug: "kelas-psikoedukasi-sekolah",
    title: "Kelas Psikoedukasi Sekolah",
    summary:
      "Rangkaian kelas untuk siswa dan guru soal mengenali tekanan, meminta bantuan, dan menjaga teman.",
    coverImageUrl: null,
    category: categories.communities,
    focusAreas: [focusAreas.pengasuhan, focusAreas.pengembanganDiri],
    deliveryModes: ["In Person"],
    sessionCount: 6,
    sessionMinutes: 75,
    priceIdr: null,
    overview: [
      "Enam kelas tatap muka di sekolah, empat untuk siswa dan dua untuk orang dewasa di sekitar mereka. Bahasanya disesuaikan dengan jenjang, dan tidak ada satu pun sesi yang meminta siswa menceritakan masalah pribadinya di depan kelas.",
      "Dua kelas terakhir sengaja ditujukan ke guru dan orang tua, karena siswa yang sudah tahu cara meminta bantuan tetap butuh orang dewasa yang tahu cara menerimanya.",
    ],
    whoItIsFor: [
      "Sekolah yang belum punya guru bimbingan konseling dengan latar psikologi",
      "Sekolah yang ingin membekali guru sebelum ada kejadian, bukan sesudah",
      "Komite orang tua yang ingin ikut memahami tekanan yang dihadapi anak",
    ],
    curriculum: [
      {
        id: "sol-3-s1",
        title: "Apa Itu Kesehatan Mental",
        summary:
          "Kelas pembuka untuk siswa: membedakan sedih biasa dari keadaan yang perlu ditemani.",
      },
      {
        id: "sol-3-s2",
        title: "Mengenali Perasaan Sendiri",
        summary:
          "Melatih siswa menamai apa yang sedang dirasakan sebelum sampai ke titik meledak.",
      },
      {
        id: "sol-3-s3",
        title: "Tekanan Akademik dan Cara Membaginya",
        summary:
          "Membicarakan beban tugas dan ujian, serta ke siapa bisa bercerita di sekolah.",
      },
      {
        id: "sol-3-s4",
        title: "Menjadi Teman yang Bisa Diandalkan",
        summary:
          "Apa yang bisa dilakukan siswa untuk teman yang sedang berat, dan kapan harus memberi tahu orang dewasa.",
      },
      {
        id: "sol-3-s5",
        title: "Bekal untuk Guru dan Wali Kelas",
        summary:
          "Mengenali perubahan yang perlu diperhatikan dan cara menanggapi siswa yang datang bercerita.",
      },
      {
        id: "sol-3-s6",
        title: "Pertemuan Orang Tua",
        summary:
          "Membahas apa yang sudah dipelajari anak di kelas dan bagaimana melanjutkannya di rumah.",
      },
    ],
    leadProfessionalSlug: "eka-nurhaliza",
    partners: [partners.atmaConnect],
    createdAt: "2026-05-08T02:00:00.000Z",
  },
  {
    id: "sol-4",
    slug: "pendampingan-pemulihan-burnout",
    title: "Pendampingan Pemulihan Burnout",
    summary:
      "Delapan minggu terarah untuk memulihkan tenaga dan menata ulang beban kerja bersama satu pendamping tetap.",
    coverImageUrl: null,
    category: categories.individuals,
    focusAreas: [focusAreas.burnout, focusAreas.polaTidur],
    deliveryModes: ["Online", "In Person"],
    sessionCount: 8,
    sessionMinutes: 60,
    priceIdr: 4200000,
    overview: [
      "Delapan pertemuan mingguan dengan satu pendamping yang sama, untuk keadaan yang sudah lewat dari lelah biasa — bangun pagi tanpa tenaga, pekerjaan yang dulu disukai jadi terasa hampa, dan tidur yang tidak lagi memulihkan.",
      "Urutannya sengaja dimulai dari tidur dan tenaga sebelum menyentuh soal pekerjaan, karena menata ulang beban kerja hampir selalu gagal kalau badannya sendiri masih kehabisan bahan bakar. Pertemuan bisa daring maupun tatap muka, dan boleh berganti di tengah jalan.",
    ],
    whoItIsFor: [
      "Sudah beberapa bulan merasa kehabisan tenaga meski jam kerjanya tidak bertambah",
      "Mulai kehilangan minat pada pekerjaan yang dulu terasa berarti",
      "Tidur cukup lama tapi bangun tetap terasa lelah",
      "Sudah mencoba libur panjang tapi lelahnya kembali dalam beberapa hari",
    ],
    curriculum: [
      {
        id: "sol-4-s1",
        title: "Memetakan Kelelahan",
        summary:
          "Menceritakan perjalanan sampai ke titik ini dan menandai kapan tenaganya mulai habis.",
      },
      {
        id: "sol-4-s2",
        title: "Memperbaiki Tidur Lebih Dulu",
        summary:
          "Menata jam tidur dan kebiasaan menjelang tidur sebelum menyentuh hal lain.",
      },
      {
        id: "sol-4-s3",
        title: "Melihat ke Mana Tenaga Habis",
        summary:
          "Mencatat kegiatan sepekan untuk melihat apa yang paling banyak menguras.",
      },
      {
        id: "sol-4-s4",
        title: "Memisahkan Beban yang Bisa dan Tidak Bisa Diubah",
        summary:
          "Membedakan bagian pekerjaan yang masih dalam kendali dari yang tidak.",
      },
      {
        id: "sol-4-s5",
        title: "Menyusun Ulang Beban Kerja",
        summary:
          "Menentukan apa yang bisa dilepas, ditunda, atau dibicarakan dengan atasan.",
      },
      {
        id: "sol-4-s6",
        title: "Mengembalikan Kegiatan yang Memulihkan",
        summary:
          "Menemukan kembali kegiatan di luar pekerjaan yang dulu terasa mengisi.",
      },
      {
        id: "sol-4-s7",
        title: "Menjaga Batas Setelah Merasa Lebih Baik",
        summary:
          "Menyiapkan tanda-tanda awal supaya keadaan yang sama tidak berulang.",
      },
      {
        id: "sol-4-s8",
        title: "Penutup dan Rencana Mandiri",
        summary:
          "Meninjau perubahan sepanjang delapan minggu dan menyusun rencana tanpa pendamping.",
      },
    ],
    leadProfessionalSlug: "fajar-ramadhan",
    partners: [partners.atmaConnect],
    createdAt: "2026-05-11T02:00:00.000Z",
  },
  {
    id: "sol-5",
    slug: "pelatihan-mental-health-first-aid",
    title: "Pelatihan Mental Health First Aid",
    summary:
      "Melatih tim internal mengenali tanda awal dan menemani rekan kerja sampai bantuan profesional datang.",
    coverImageUrl: null,
    category: categories.workplaces,
    focusAreas: [focusAreas.kecemasan, focusAreas.trauma],
    deliveryModes: ["In Person"],
    sessionCount: 2,
    sessionMinutes: 240,
    priceIdr: null,
    overview: [
      "Dua hari pelatihan tatap muka untuk sekelompok kecil karyawan yang akan jadi titik pertama ketika rekan kerja sedang tidak baik-baik saja. Ini bukan pelatihan menjadi terapis, dan itu ditegaskan sejak jam pertama.",
      "Yang dilatih adalah menemani sampai bantuan yang tepat datang: mengenali tanda awal, membuka percakapan tanpa menghakimi, dan tahu batas — kapan sebuah keadaan sudah harus diserahkan ke profesional, bukan ditangani sendiri.",
    ],
    whoItIsFor: [
      "Perusahaan yang ingin menyiapkan beberapa orang sebagai titik pertama di kantor",
      "Tim HR yang sering menerima karyawan datang bercerita tanpa bekal menanggapi",
      "Atasan langsung yang ingin tahu batas antara menemani dan menangani",
    ],
    curriculum: [
      {
        id: "sol-5-s1",
        title: "Hari Pertama: Mengenali dan Membuka Percakapan",
        summary:
          "Tanda awal yang bisa diperhatikan, dan cara bertanya yang tidak membuat orang menutup diri.",
      },
      {
        id: "sol-5-s2",
        title: "Hari Kedua: Menemani dan Merujuk",
        summary:
          "Latihan peran menghadapi keadaan sulit, lalu menyusun jalur rujukan yang jelas di kantor sendiri.",
      },
    ],
    leadProfessionalSlug: "chandra-wijaya",
    partners: [partners.mhfa],
    createdAt: "2026-05-13T02:00:00.000Z",
  },
  {
    id: "sol-6",
    slug: "kelompok-dukungan-duka-cita",
    title: "Kelompok Dukungan Duka Cita",
    summary:
      "Kelompok kecil berpemandu untuk yang sedang kehilangan, dengan aturan kerahasiaan yang disepakati bersama.",
    coverImageUrl: null,
    category: categories.communities,
    focusAreas: [focusAreas.dukaCita, focusAreas.hubungan],
    deliveryModes: ["Online"],
    sessionCount: 6,
    sessionMinutes: 90,
    priceIdr: 900000,
    overview: [
      "Enam pertemuan daring untuk kelompok kecil yang sedang berduka. Pemandunya psikolog, tapi bentuknya bukan terapi kelompok — yang bekerja di sini justru kehadiran orang lain yang sedang melewati hal serupa.",
      "Pertemuan pertama dipakai menyusun kesepakatan bersama: apa yang boleh diceritakan di luar kelompok, dan hak setiap orang untuk hadir tanpa bicara sama sekali. Tidak ada kewajiban bercerita di pertemuan mana pun.",
    ],
    whoItIsFor: [
      "Baru kehilangan orang dekat dan merasa tidak ada tempat membicarakannya",
      "Merasa orang di sekitar sudah berhenti bertanya padahal dukanya belum reda",
      "Lebih tertolong mendengar orang lain daripada berbicara satu lawan satu",
      "Ingin ditemani tanpa harus menjelaskan dari awal setiap kali",
    ],
    curriculum: [
      {
        id: "sol-6-s1",
        title: "Perkenalan dan Kesepakatan Kelompok",
        summary:
          "Menyusun aturan kerahasiaan bersama dan menegaskan hak untuk hadir tanpa bicara.",
      },
      {
        id: "sol-6-s2",
        title: "Menceritakan Kehilangan",
        summary:
          "Ruang bagi yang ingin bercerita, dengan giliran yang boleh dilewati.",
      },
      {
        id: "sol-6-s3",
        title: "Duka yang Tidak Berjalan Lurus",
        summary:
          "Membicarakan hari-hari yang tiba-tiba terasa berat lagi setelah sempat membaik.",
      },
      {
        id: "sol-6-s4",
        title: "Menghadapi Tanggal dan Tempat yang Mengingatkan",
        summary:
          "Menyiapkan diri menghadapi hari ulang tahun, hari raya, dan tempat yang penuh kenangan.",
      },
      {
        id: "sol-6-s5",
        title: "Hubungan dengan Orang di Sekitar",
        summary:
          "Membicarakan keluarga dan rekan yang berduka dengan cara berbeda, atau yang tidak tahu harus berkata apa.",
      },
      {
        id: "sol-6-s6",
        title: "Penutup",
        summary:
          "Meninjau perjalanan enam pertemuan dan membicarakan cara saling mengabari sesudahnya.",
      },
    ],
    leadProfessionalSlug: "chandra-wijaya",
    partners: [],
    createdAt: "2026-05-15T02:00:00.000Z",
  },
  {
    id: "sol-7",
    slug: "terapi-trauma-terarah",
    title: "Terapi Trauma Terarah",
    summary:
      "Penanganan bertahap oleh psikolog klinis, dimulai dari asesmen dan penyusunan rencana bersama.",
    coverImageUrl: null,
    category: categories.individuals,
    focusAreas: [focusAreas.trauma],
    deliveryModes: ["In Person"],
    sessionCount: 10,
    sessionMinutes: 60,
    priceIdr: 3900000,
    overview: [
      "Sepuluh pertemuan tatap muka dengan psikolog klinis untuk keadaan yang berakar pada pengalaman yang belum selesai. Seluruh rangkaiannya tatap muka, dan itu pilihan yang disengaja — penanganan trauma butuh ruang yang bisa dijaga dan kehadiran yang penuh.",
      "Tiga pertemuan pertama dipakai untuk asesmen dan menyiapkan pijakan, bukan langsung membuka ingatan yang berat. Kecepatannya ditentukan bersama, dan boleh melambat kapan pun tanpa dianggap gagal.",
    ],
    whoItIsFor: [
      "Ada pengalaman masa lalu yang masih terasa mengganggu sampai sekarang",
      "Sering terbangun atau teringat kejadian tertentu tanpa bisa dikendalikan",
      "Menghindari tempat, orang, atau situasi tertentu tanpa bisa menjelaskan sebabnya",
      "Sudah pernah konseling umum dan merasa butuh penanganan yang lebih terarah",
    ],
    curriculum: [
      {
        id: "sol-7-s1",
        title: "Asesmen Awal",
        summary:
          "Mengenali riwayat dan keluhan yang muncul sekarang, tanpa masuk ke rincian kejadian.",
      },
      {
        id: "sol-7-s2",
        title: "Menyiapkan Pijakan",
        summary:
          "Melatih cara menenangkan diri yang bisa dipakai sebelum masuk bagian yang berat.",
      },
      {
        id: "sol-7-s3",
        title: "Menyusun Rencana Bersama",
        summary:
          "Menyepakati urutan, kecepatan, dan tanda kapan harus berhenti sejenak.",
      },
      {
        id: "sol-7-s4",
        title: "Memahami Reaksi Tubuh",
        summary:
          "Melihat kenapa tubuh bereaksi seolah bahayanya masih ada sampai hari ini.",
      },
      {
        id: "sol-7-s5",
        title: "Mulai Menyentuh Ingatan",
        summary:
          "Membuka bagian yang sudah disiapkan, dengan kecepatan yang sudah disepakati.",
      },
      {
        id: "sol-7-s6",
        title: "Melanjutkan dengan Jeda",
        summary:
          "Meneruskan pengolahan sambil memeriksa apa yang terasa di antara pertemuan.",
      },
      {
        id: "sol-7-s7",
        title: "Menata Ulang Cara Memaknai",
        summary:
          "Meninjau kesimpulan tentang diri sendiri yang terbentuk dari kejadian itu.",
      },
      {
        id: "sol-7-s8",
        title: "Mendekati Hal yang Dihindari",
        summary:
          "Bertahap mendekati situasi yang selama ini dijauhi, satu langkah kecil sekali waktu.",
      },
      {
        id: "sol-7-s9",
        title: "Memulihkan Hubungan dan Kegiatan",
        summary:
          "Mengembalikan hal-hal yang sempat berhenti karena keluhannya.",
      },
      {
        id: "sol-7-s10",
        title: "Penutup dan Rencana Menjaga",
        summary:
          "Meninjau sepuluh pertemuan dan menyiapkan langkah kalau keluhannya kembali.",
      },
    ],
    leadProfessionalSlug: "intan-larasati",
    partners: [],
    createdAt: "2026-05-18T02:00:00.000Z",
  },
  {
    id: "sol-8",
    slug: "asesmen-iklim-kerja",
    title: "Asesmen Iklim Kerja",
    summary:
      "Survei dan wawancara untuk memetakan sumber tekanan di tim, ditutup dengan rekomendasi yang bisa dijalankan.",
    coverImageUrl: null,
    category: categories.workplaces,
    focusAreas: [focusAreas.stres, focusAreas.pengembanganDiri],
    deliveryModes: ["Online"],
    sessionCount: 3,
    sessionMinutes: 120,
    priceIdr: null,
    overview: [
      "Tiga tahap untuk memetakan dari mana tekanan di sebuah tim sebenarnya datang: survei ke seluruh anggota, wawancara dengan sebagian, lalu penyerahan temuan beserta rekomendasi.",
      "Jawaban survei dan isi wawancara tidak pernah diserahkan per orang. Laporannya berbentuk pola dan kesimpulan, karena asesmen yang jawabannya bisa dilacak ke individu akan dijawab dengan hati-hati, dan hasilnya jadi tidak berguna.",
    ],
    whoItIsFor: [
      "Perusahaan yang melihat pergantian karyawan tinggi tapi belum tahu sebabnya",
      "Manajemen yang ingin memutuskan berdasarkan data, bukan kesan",
      "Tim yang ingin memetakan keadaan sebelum memilih program lanjutan",
    ],
    curriculum: [
      {
        id: "sol-8-s1",
        title: "Survei ke Seluruh Anggota Tim",
        summary:
          "Pengisian daring yang jawabannya tidak bisa dilacak ke orang tertentu.",
      },
      {
        id: "sol-8-s2",
        title: "Wawancara Mendalam",
        summary:
          "Percakapan dengan sebagian anggota untuk memahami angka yang muncul di survei.",
      },
      {
        id: "sol-8-s3",
        title: "Penyerahan Temuan dan Rekomendasi",
        summary:
          "Memaparkan pola yang ditemukan beserta langkah yang bisa dijalankan manajemen.",
      },
    ],
    leadProfessionalSlug: null,
    partners: [partners.atmaConnect],
    createdAt: "2026-05-20T02:00:00.000Z",
  },
  {
    id: "sol-9",
    slug: "layanan-konseling-kampus",
    title: "Layanan Konseling Kampus",
    summary:
      "Kerja sama dengan kampus untuk membuka jam konseling tetap bagi mahasiswa, daring maupun di tempat.",
    coverImageUrl: null,
    category: categories.communities,
    focusAreas: [focusAreas.kecemasan, focusAreas.pengembanganDiri],
    deliveryModes: ["Online", "In Person"],
    sessionCount: 8,
    sessionMinutes: 60,
    priceIdr: null,
    overview: [
      "Kerja sama satu semester dengan kampus untuk membuka jam konseling tetap bagi mahasiswa. Delapan pertemuan di bawah ini adalah tahapan penyiapannya, bukan jumlah sesi konseling — jam konselingnya sendiri berjalan terus selama semester.",
      "Mahasiswa mendaftar sendiri tanpa lewat dosen atau pihak fakultas, dan kampus hanya menerima laporan jumlah pemakaian. Pemisahan itu disengaja: layanan yang pendaftarannya diketahui pihak kampus akan sepi, sebaik apa pun layanannya.",
    ],
    whoItIsFor: [
      "Kampus yang belum punya layanan konseling tetap bagi mahasiswa",
      "Kampus yang sudah punya unit bimbingan tapi kewalahan menampung permintaan",
      "Fakultas yang ingin menyiapkan jalur rujukan sebelum ada kejadian",
    ],
    curriculum: [
      {
        id: "sol-9-s1",
        title: "Pemetaan Kebutuhan Kampus",
        summary:
          "Melihat jumlah mahasiswa, layanan yang sudah ada, dan celah yang perlu diisi.",
      },
      {
        id: "sol-9-s2",
        title: "Menyusun Alur Pendaftaran Mandiri",
        summary:
          "Membangun jalur yang tidak melewati dosen atau pihak fakultas.",
      },
      {
        id: "sol-9-s3",
        title: "Menyiapkan Ruang dan Jadwal",
        summary:
          "Menentukan jam praktik dan ruang yang percakapannya tidak terdengar dari luar.",
      },
      {
        id: "sol-9-s4",
        title: "Kesepakatan Kerahasiaan",
        summary:
          "Menyepakati apa yang dilaporkan ke kampus dan apa yang tidak, secara tertulis.",
      },
      {
        id: "sol-9-s5",
        title: "Pengenalan ke Mahasiswa",
        summary:
          "Memperkenalkan layanan lewat jalur yang benar-benar dibaca mahasiswa.",
      },
      {
        id: "sol-9-s6",
        title: "Bekal untuk Dosen Wali",
        summary:
          "Membekali dosen mengenali mahasiswa yang perlu diarahkan ke layanan.",
      },
      {
        id: "sol-9-s7",
        title: "Tinjauan Tengah Semester",
        summary:
          "Melihat pemakaian sejauh ini dan menyesuaikan jam praktik bila perlu.",
      },
      {
        id: "sol-9-s8",
        title: "Laporan Akhir Semester",
        summary:
          "Menyerahkan angka pemakaian dan menimbang kelanjutan semester berikutnya.",
      },
    ],
    leadProfessionalSlug: "gita-maheswari",
    partners: [partners.mhfa],
    createdAt: "2026-05-22T02:00:00.000Z",
  },
];

export async function getSolutions(): Promise<Solution[]> {
  return solutions;
}

export async function getSolutionBySlug(
  slug: string,
): Promise<Solution | null> {
  return solutions.find((item) => item.slug === slug) ?? null;
}

// Urutannya: kategori sama dulu, lalu yang berbagi minimal satu focus area, lalu
// siapa pun — supaya rail terakhir di halaman detail tidak pernah kosong.
// Berbeda dengan `getRelatedArticles`, cabang pertama di sini BENAR-BENAR
// terpakai: sembilan solusi terbagi rata tiga-tiga per kategori.
export async function getRelatedSolutions(
  slug: string,
  limit = 3,
): Promise<Solution[]> {
  const current = solutions.find((item) => item.slug === slug);
  if (!current) return [];

  const others = solutions.filter((item) => item.slug !== slug);
  const currentFocus = new Set(current.focusAreas.map((area) => area.slug));

  const sameCategory = others.filter(
    (item) => item.category.slug === current.category.slug,
  );
  const sharedFocus = others.filter(
    (item) =>
      item.category.slug !== current.category.slug &&
      item.focusAreas.some((area) => currentFocus.has(area.slug)),
  );

  const ordered = [...sameCategory, ...sharedFocus, ...others];
  const unique = ordered.filter(
    (item, index) => ordered.findIndex((one) => one.id === item.id) === index,
  );

  return unique.slice(0, limit);
}

export async function getSolutionCategories(): Promise<SolutionCategory[]> {
  const bySlug = new Map<string, SolutionCategory>();
  for (const item of solutions) {
    bySlug.set(item.category.slug, item.category);
  }
  return [...bySlug.values()];
}

export async function getSolutionPartners(): Promise<SolutionPartner[]> {
  const bySlug = new Map<string, SolutionPartner>();
  for (const item of solutions) {
    for (const partner of item.partners) {
      bySlug.set(partner.slug, partner);
    }
  }
  return [...bySlug.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "id-ID"),
  );
}
