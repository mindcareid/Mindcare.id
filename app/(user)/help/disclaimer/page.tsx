import type { Metadata } from "next";
import NotPublishedYet from "../section/NotPublishedYet";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Mindcare's disclaimer has not been published yet.",
  robots: { index: false, follow: true },
};

export default function DisclaimerPage() {
  return (
    <NotPublishedYet
      title="Disclaimer"
      summary="Batas tanggung jawab MindCare sebagai direktori belum kami tuangkan ke satu dokumen."
    />
  );
}
