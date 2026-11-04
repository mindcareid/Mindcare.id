import type { Metadata } from "next";

import SponsorTiersManager from "./components/SponsorTiersManager";

export const metadata: Metadata = { title: "Sponsorship Packages — Admin" };

export default function SponsorTiersPage({
  params,
}: {
  params: { id: string };
}) {
  return <SponsorTiersManager eventId={Number(params.id)} />;
}
