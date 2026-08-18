import PartnerGrid from "./PartnerGrid";
import { getPartners } from "@/lib/partners/queries";

export const metadata = {
  title: "Partners | Execorner",
  description: "Our trusted partners",
};

export default async function PartnersPage() {
  const companies = await getPartners();

  return <PartnerGrid companies={companies} />;
}