import type {
  Solution,
  SolutionCategory,
  SolutionFocusArea,
  SolutionPartner,
} from "../type/solution";
import prisma from "@/lib/prisma";
import { PUBLIC_SOLUTION_SELECT, mapSolution } from "../../data/listingMappers";

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

type SolutionFixture = Omit<
  Solution,
  | "organizationName"
  | "logoUrl"
  | "website"
  | "contactEmail"
  | "contactPhone"
  | "audiences"
  | "sessionCount"
  | "sessionMinutes"
  | "priceIdr"
  | "curriculum"
  | "deliveryModes"
>;

const solutions: any[] = [
  {
    id: "sol-1",
    slug: "konseling-individu-daring",
    title: "Konseling Individu Daring",
    summary:
      "Sesi satu lawan satu dengan psikolog dari direktori, dijadwalkan sesuai waktu yang kamu pilih.",
    coverImageUrl: null,
    category: categories.individuals,
    focusAreas: [focusAreas.kecemasan, focusAreas.stres],

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

    overview: [
      "Program setahun untuk satu perusahaan: dua belas pertemuan bulanan untuk seluruh karyawan, ditambah kuota konseling pribadi yang bisa dipakai siapa pun tanpa perlu izin atasan.",
      "Laporan ke perusahaan hanya berbentuk angka agregat — berapa banyak kuota terpakai dan tema apa yang paling sering muncul. Siapa yang datang dan apa yang diceritakan tidak pernah sampai ke manajemen, dan kesepakatan itu dibacakan di pertemuan pertama supaya semua orang mendengarnya langsung.",
    ],
    whoItIsFor: [
      "Perusahaan yang mulai melihat tanda kelelahan menumpuk di beberapa tim",
      "Tim HR yang butuh jalur rujukan jelas ketika ada karyawan datang bercerita",
      "Perusahaan yang ingin program berjalan setahun, bukan satu sesi lalu selesai",
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

    overview: [
      "Enam kelas tatap muka di sekolah, empat untuk siswa dan dua untuk orang dewasa di sekitar mereka. Bahasanya disesuaikan dengan jenjang, dan tidak ada satu pun sesi yang meminta siswa menceritakan masalah pribadinya di depan kelas.",
      "Dua kelas terakhir sengaja ditujukan ke guru dan orang tua, karena siswa yang sudah tahu cara meminta bantuan tetap butuh orang dewasa yang tahu cara menerimanya.",
    ],
    whoItIsFor: [
      "Sekolah yang belum punya guru bimbingan konseling dengan latar psikologi",
      "Sekolah yang ingin membekali guru sebelum ada kejadian, bukan sesudah",
      "Komite orang tua yang ingin ikut memahami tekanan yang dihadapi anak",
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

    overview: [
      "Dua hari pelatihan tatap muka untuk sekelompok kecil karyawan yang akan jadi titik pertama ketika rekan kerja sedang tidak baik-baik saja. Ini bukan pelatihan menjadi terapis, dan itu ditegaskan sejak jam pertama.",
      "Yang dilatih adalah menemani sampai bantuan yang tepat datang: mengenali tanda awal, membuka percakapan tanpa menghakimi, dan tahu batas — kapan sebuah keadaan sudah harus diserahkan ke profesional, bukan ditangani sendiri.",
    ],
    whoItIsFor: [
      "Perusahaan yang ingin menyiapkan beberapa orang sebagai titik pertama di kantor",
      "Tim HR yang sering menerima karyawan datang bercerita tanpa bekal menanggapi",
      "Atasan langsung yang ingin tahu batas antara menemani dan menangani",
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

    overview: [
      "Tiga tahap untuk memetakan dari mana tekanan di sebuah tim sebenarnya datang: survei ke seluruh anggota, wawancara dengan sebagian, lalu penyerahan temuan beserta rekomendasi.",
      "Jawaban survei dan isi wawancara tidak pernah diserahkan per orang. Laporannya berbentuk pola dan kesimpulan, karena asesmen yang jawabannya bisa dilacak ke individu akan dijawab dengan hati-hati, dan hasilnya jadi tidak berguna.",
    ],
    whoItIsFor: [
      "Perusahaan yang melihat pergantian karyawan tinggi tapi belum tahu sebabnya",
      "Manajemen yang ingin memutuskan berdasarkan data, bukan kesan",
      "Tim yang ingin memetakan keadaan sebelum memilih program lanjutan",
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

    overview: [
      "Kerja sama satu semester dengan kampus untuk membuka jam konseling tetap bagi mahasiswa. Delapan pertemuan di bawah ini adalah tahapan penyiapannya, bukan jumlah sesi konseling — jam konselingnya sendiri berjalan terus selama semester.",
      "Mahasiswa mendaftar sendiri tanpa lewat dosen atau pihak fakultas, dan kampus hanya menerima laporan jumlah pemakaian. Pemisahan itu disengaja: layanan yang pendaftarannya diketahui pihak kampus akan sepi, sebaik apa pun layanannya.",
    ],
    whoItIsFor: [
      "Kampus yang belum punya layanan konseling tetap bagi mahasiswa",
      "Kampus yang sudah punya unit bimbingan tapi kewalahan menampung permintaan",
      "Fakultas yang ingin menyiapkan jalur rujukan sebelum ada kejadian",
    ],
    leadProfessionalSlug: "gita-maheswari",
    partners: [partners.mhfa],
    createdAt: "2026-05-22T02:00:00.000Z",
  },
];

export async function getSolutions(): Promise<Solution[]> {
  const rows = await prisma.solution.findMany({
    where: { listingStatus: "LISTED", deletedAt: null },
    select: PUBLIC_SOLUTION_SELECT,
    orderBy: { createdAt: "desc" },
  });

  return rows.map(mapSolution);
}

export async function getSolutionBySlug(
  slug: string,
): Promise<Solution | null> {
  const row = await prisma.solution.findFirst({
    where: { slug, listingStatus: "LISTED", deletedAt: null },
    select: PUBLIC_SOLUTION_SELECT,
  });

  return row ? mapSolution(row) : null;
}
export async function getRelatedSolutions(
  slug: string,
  limit = 3,
): Promise<Solution[]> {
  const all = await getSolutions();
  const current = all.find((item) => item.slug === slug);
  if (!current) return [];

  const others = all.filter((item) => item.slug !== slug);
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
  const rows = await prisma.solutionCategory.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
    select: { id: true, slug: true, name: true, theme: true },
  });

  return rows.map((row) => ({
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    theme:
      row.theme === "purple" || row.theme === "emerald" ? row.theme : "navy",
  }));
}
export async function getSolutionPartners(): Promise<SolutionPartner[]> {
  return [];
}
