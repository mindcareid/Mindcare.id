import type { Metadata } from "next";
import NotPublishedYet from "../section/NotPublishedYet";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Mindcare's terms of service have not been published yet.",
  robots: { index: false, follow: true },
};

export default function TermsOfServicePage() {
  return (
    <NotPublishedYet
      title="Terms of Service"
      summary="Ketentuan pemakaian MindCare belum kami terbitkan."
    />
  );
}
