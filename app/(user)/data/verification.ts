// Verifikasi: kontrak data + semua nilai turunannya.
//
// Alasan lengkap ada di `design.md` bagian 21. Ringkasnya, `isVerified: boolean`
// dihapus pada 24 Agustus 2026 karena boolean cuma bisa menjawab "pernah bilang
// ya atau belum". Dia TIDAK bisa membedakan tiga hal yang artinya jauh berbeda:
//
//   - belum pernah mengajukan apa pun
//   - pernah mengajukan lalu ditolak
//   - pernah lolos, tapi izinnya sudah kedaluwarsa
//
// Ketiganya jadi `false` yang sama. Ini pelajaran `priceIdr: null` di Solutions
// yang terulang: ketiadaan punya beberapa arti, dan begitu digabung jadi satu
// nilai, halamannya mulai berbohong.
//
// SATU HAL YANG PALING PENTING DI FILE INI: keadaan yang dipakai UI adalah
// NILAI TURUNAN, bukan field. `verified` dan `expired` dibedakan oleh
// `validUntil` dibanding tanggal hari ini — jadi kalau keadaannya disimpan
// sebagai enam-keadaan di data, nilainya beku persis seperti `isOpenNow` yang
// sudah dihapus di `care-centres` (design.md bagian 20). Badge yang tidak pernah
// kedaluwarsa perlahan jadi bohong tanpa ada yang menyunting apa pun.
//
// File ini SENGAJA tidak punya `"use client"`, alasan yang sama dengan
// `care-centres/data/centreHours.ts` dan `events/data/eventTime.ts`: halaman
// daftar merender badge di komponen berstate (klien), halaman detail merendernya
// di server. Modul yang dipanggil dua-duanya harus netral. Dan karena file ini
// tidak memuat mock data apa pun, komponen klien yang cuma butuh satu label
// tidak ikut menarik array profesional atau centre ke bundel browser.
//
// Letaknya di `app/(user)/data/` — bukan di dalam salah satu fitur — karena
// yang memakainya lima fitur sekaligus (professionals, care-centres, events,
// solutions, dan halaman depan). Menaruhnya di `professionals/` akan membuat
// `care-centres` mengimpor dari folder fitur lain.

/**
 * Hasil review yang BENAR-BENAR DISIMPAN. Lima nilai, semuanya keputusan yang
 * pernah diambil manusia pada satu tanggal — tidak ada yang berubah sendiri
 * karena waktu berjalan.
 *
 * `expired` sengaja TIDAK ada di sini. Kedaluwarsa itu akibat tanggal, bukan
 * keputusan; lihat `verificationStateOf`.
 */
export type VerificationReview =
  /** Belum pernah ada pengajuan dan belum pernah diperiksa admin. */
  | "none"
  /** Dokumen sudah masuk, sedang direview. Belum ada hasil. */
  | "pending"
  /** Dokumen dilihat dan nomornya cocok di pangkalan data penerbit. */
  | "approved"
  /** Dokumen tidak cocok, tidak lengkap, atau bukan milik yang mengajukan. */
  | "rejected"
  /** Pernah `approved`, lalu dicabut Mindcare. Bukan hal yang sama dengan kedaluwarsa. */
  | "revoked";

/**
 * Dari mana kredensialnya masuk ke Mindcare.
 *
 * `"registry"` ada karena keputusan diaze 24 Agustus 2026: fasilitas publik
 * (puskesmas, RSUD) boleh diverifikasi admin langsung dari pangkalan data
 * Kemenkes yang terbuka, TANPA ada yang mengajukan. Kalau verified hanya bisa
 * lewat pengajuan, klinik swasta yang paham pemasaran dapat centang sementara
 * puskesmas yang paling terjangkau tidak — dan bias itu jatuh tepat pada
 * pengguna yang paling butuh layanan murah.
 *
 * Disimpan terpisah, bukan disamarkan, supaya nanti bisa dijawab "verified ini
 * asalnya dari mana" tanpa menebak.
 */
export type VerificationSource = "submission" | "registry";

/**
 * Yang diverifikasi itu orang atau bangunan. Dua-duanya TIDAK boleh memakai kata
 * yang sama, karena yang diperiksa berbeda: orang punya surat tanda registrasi
 * dan surat izin praktik, fasilitas punya izin operasional dan nomor registrasi
 * fasilitas.
 */
export type VerificationSubject = "person" | "facility";

/**
 * Yang disimpan di entitas. Ini lapisan ketiga dari tiga lapisan di design.md
 * 21.3 — dua lapisan pertama (`VerificationCase` per pengajuan dan `Credential`
 * per dokumen) baru ada saat skema database dibuat.
 *
 * JANGAN menambahkan nomor STR/SIP/izin ke bentuk ini. Nomor izin tidak
 * ditampilkan di halaman publik (design.md pasal 16), dan field yang ada di
 * kontrak data halaman publik cepat atau lambat akan dirender oleh seseorang.
 */
export interface Verification {
  review: VerificationReview;
  /**
   * Tanggal admin mencocokkan dokumen, format `"YYYY-MM-DD"`.
   *
   * `null` WAJIB kalau `review` masih `"none"` atau `"pending"` — belum ada
   * tanggal karena belum ada yang diperiksa. Untuk tiga hasil lainnya wajib
   * terisi: tanpa tanggal, badge tidak bisa mengklaim apa pun yang jujur.
   */
  checkedOn: string | null;
  /**
   * Hari TERAKHIR dokumen masih berlaku (inklusif), format `"YYYY-MM-DD"`.
   * Kalau satu pihak punya beberapa dokumen, yang dicatat di sini adalah yang
   * paling cepat habis — satu dokumen mati sudah cukup membuat klaimnya gugur.
   *
   * Hanya terisi kalau `review === "approved"`. Untuk hasil lain `null`, karena
   * masa berlaku sesuatu yang tidak pernah diterima tidak ada artinya.
   */
  validUntil: string | null;
  /** `null` selama belum ada hasil review. */
  source: VerificationSource | null;
}

/**
 * Keadaan yang dipakai UI. Enam nilai, dan hanya lima di antaranya yang bisa
 * dibaca langsung dari `review` — `"expired"` selalu hasil hitungan.
 */
export type VerificationState =
  | "unverified"
  | "pending"
  | "verified"
  | "expired"
  | "rejected"
  | "revoked";

/**
 * Zona waktu yang menentukan "hari ini" untuk masa berlaku.
 *
 * Masa berlaku izin berketelitian tanggal, bukan jam, jadi harus ada satu zona
 * yang memutuskan tanggal berapa sekarang. Dipilih WIB karena yang menerbitkan
 * dokumennya lembaga Indonesia dan Mindcare direktori Indonesia — jadi izin yang
 * berlaku "sampai 31 Mei" berakhir di penghujung 31 Mei menurut jam Jakarta,
 * bukan menurut jam mesin yang kebetulan merender halamannya.
 *
 * Perhatikan ini SENGAJA berbeda dari `CareCentre.timeZone`: jam buka klinik
 * Denpasar itu WITA karena yang ditanya "apakah pintunya terbuka sekarang", dan
 * itu pertanyaan tentang tempatnya. Masa berlaku izin bukan pertanyaan tentang
 * tempatnya, jadi tidak ikut zona centre-nya.
 */
export const VERIFICATION_TIME_ZONE = "Asia/Jakarta";

/** Satu-satunya tempat alamat halaman kebijakan ditulis. */
export const VERIFICATION_POLICY_PATH = "/help/verification-policy";

/**
 * Label badge per subjek — rules.md pasal 7: label tampilan bahasa Inggris.
 *
 * Kata-katanya dibatasi keputusan diaze 24 Agustus 2026: badge hanya mengklaim
 * "dokumennya dilihat dan nomornya dicocokkan ke pangkalan data penerbit".
 * Bukan penilaian mutu, bukan penyaringan keluhan, bukan atestasi institusi.
 * Karena itu bunyinya "checked", bukan "approved", "trusted", atau "certified" —
 * tiga kata yang mengklaim jauh lebih banyak daripada yang benar-benar dikerjakan.
 */
export const VERIFICATION_LABELS: Record<VerificationSubject, string> = {
  person: "Licence checked",
  facility: "Licence & permit checked",
};

/**
 * Tanggal hari ini di `VERIFICATION_TIME_ZONE`, sebagai `"YYYY-MM-DD"`.
 *
 * Digitnya diambil lewat `Intl` dengan `timeZone` eksplisit, BUKAN lewat
 * `new Date(now).getDate()` — yang terakhir mengembalikan tanggal menurut zona
 * mesin yang merender, dan di server produksi itu biasanya UTC. Bedanya cuma
 * tujuh jam, tapi tepat cukup untuk membuat izin yang habis "31 Mei" terlihat
 * masih hidup di pagi 1 Juni WIB.
 */
function todayIn(now: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now));

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

/**
 * Keadaan verifikasi pada saat `now`.
 *
 * `now` WAJIB dioper dari luar, tidak boleh `Date.now()` di dalam sini. Dua
 * alasan yang dua-duanya sudah pernah menggigit di fitur lain: nilai yang
 * berbeda antara render server dan hidrasi klien bikin peringatan hidrasi, dan
 * satu halaman yang memanggil ini dua kali (kartu dan hero) bisa dapat dua
 * jawaban kalau kebetulan tengah malam terlewati di antaranya.
 *
 * Perbandingan `"YYYY-MM-DD"` sebagai string itu sah: lebarnya tetap, ada nol di
 * depan, dan tidak ada offset zona yang ikut menempel di teksnya — pengecualian
 * yang sama dengan `"HH:MM"` di `centreHours.ts`.
 */
export function verificationStateOf(
  verification: Verification,
  now: string,
): VerificationState {
  switch (verification.review) {
    case "none":
      return "unverified";
    case "pending":
      return "pending";
    case "rejected":
      return "rejected";
    case "revoked":
      return "revoked";
    case "approved": {
      // Tanpa `validUntil` tidak ada yang bisa membuktikan klaimnya masih hidup,
      // jadi diperlakukan sebagai kedaluwarsa — bukan sebagai "berlaku selamanya".
      if (!verification.validUntil) return "expired";
      return todayIn(now, VERIFICATION_TIME_ZONE) <= verification.validUntil
        ? "verified"
        : "expired";
    }
  }
}

/**
 * Label badge, atau `null` kalau badge tidak boleh dirender sama sekali.
 *
 * Ini satu-satunya pintu yang boleh dipakai komponen. Sengaja mengembalikan
 * `null` alih-alih keadaannya, supaya tidak ada komponen yang bisa keliru
 * memasangkan `"pending"` atau `"expired"` dengan badge.
 *
 * `"expired"` TIDAK boleh dirender berbeda dari `"unverified"` di halaman
 * publik: badgenya HILANG, tidak berubah warna dan tidak berganti kata. Alasannya
 * bukan estetika — "Licence expired" di bawah nama seseorang itu tuduhan, dan
 * yang sebenarnya Mindcare ketahui hanyalah bahwa tanggal di dokumen yang pernah
 * dilihat sudah lewat. Itu jauh dari cukup untuk sebuah tuduhan publik.
 */
export function verificationLabelOf(
  verification: Verification,
  now: string,
  subject: VerificationSubject,
) {
  return verificationStateOf(verification, now) === "verified"
    ? VERIFICATION_LABELS[subject]
    : null;
}

const checkedOnFormatter = new Intl.DateTimeFormat("en-GB", {
  // `"YYYY-MM-DD"` dibaca `Date` sebagai tengah malam UTC. Memformatnya di zona
  // lain akan menggeser hasilnya satu hari ke belakang untuk zona barat, jadi
  // pemformatnya dikunci ke UTC. Ini BUKAN kelalaian soal zona waktu: yang
  // diformat di sini tanggal telanjang tanpa jam, bukan sebuah momen.
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

/**
 * `"2026-03-14"` → `"March 2026"`. Ketelitiannya sengaja cuma bulan.
 *
 * Tanggal persisnya tidak menambah apa pun yang berguna bagi pembaca, sementara
 * "14 Maret" mempersempit kapan seseorang mengurus dokumennya — dan itu keterangan
 * tentang orangnya, bukan tentang layanannya.
 */
export function formatCheckedOn(verification: Verification) {
  if (!verification.checkedOn) return null;
  return checkedOnFormatter.format(new Date(verification.checkedOn));
}
