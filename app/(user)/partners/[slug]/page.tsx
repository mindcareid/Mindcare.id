import { notFound } from "next/navigation";

import PartnerDetail from "./PartnerDetail";

import { getPartnerBySlug } from "@/lib/partners/queries";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { slug } = await params;

  const partner = await getPartnerBySlug(slug);

  if (!partner) {
    notFound();
  }

  return (
    <PartnerDetail
      company={partner}
      events={partner.events}
    />
  );
}