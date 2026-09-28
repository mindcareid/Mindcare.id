import type { Metadata } from "next";
import NotPublishedYet from "../section/NotPublishedYet";

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
