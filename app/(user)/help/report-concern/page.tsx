import type { Metadata } from "next";
import NotPublishedYet from "../section/NotPublishedYet";

// Halaman baru 26 Agustus 2026, dan yang paling penting dari empat placeholder
// di folder ini. Sebelumnya alamat ini 404 padahal ditautkan dari footer di
// setiap halaman — dan orang yang mengklik "Report A Concern" di direktori
// kesehatan mental kemungkinan besar sedang melaporkan sesuatu yang
// membahayakan. Menghadapkan orang itu ke halaman 404 adalah kegagalan paling
// mahal di situs ini.
//
// Yang TIDAK boleh ada di sini: nomor telepon, alamat surel, atau formulir
// karangan. Belum ada saluran pelaporan yang benar-benar dijaga siapa pun —
// tidak ada rute `/contact` publik di repo ini, cuma endpoint API dan halaman
// admin — jadi mencantumkan alamat tujuan berarti menjanjikan ada yang membaca.
// Sejalan dengan pantangan "jangan pernah mengarang nomor hotline" di
// `rules.md` pasal 10.
//
// Yang boleh, dan justru wajib: mengatakan terus terang bahwa salurannya belum
// ada, supaya orang mencari jalan lain alih-alih menunggu balasan yang tidak
// akan datang.

export const metadata: Metadata = {
  title: "Report a Concern",
  description: "Mindcare's reporting process has not been published yet.",
  robots: { index: false, follow: true },
};

export default function ReportConcernPage() {
  return (
    <NotPublishedYet
      title="Report a Concern"
      summary="Cara melaporkan profil yang keliru atau tidak aman belum kami terbitkan."
    >
      <p>
        Perlu dikatakan terang-terangan: selama halaman ini belum ada isinya,{" "}
        <strong className="font-semibold text-foreground">
          MindCare belum punya saluran pelaporan yang dijaga
        </strong>
        . Kalau ada sesuatu yang perlu ditangani hari ini, jangan menunggu
        halaman ini — cari bantuan lewat jalur yang memang sudah berjalan di
        sekitar Anda.
      </p>
      <p className="mt-4">
        Satu hal lagi yang membuat halaman ini belum berguna: isi direktori ini
        masih data contoh. Profil dan pusat layanan yang tampil sekarang belum
        mewakili orang atau tempat yang sebenarnya, jadi belum ada yang bisa
        dilaporkan.
      </p>
    </NotPublishedYet>
  );
}
