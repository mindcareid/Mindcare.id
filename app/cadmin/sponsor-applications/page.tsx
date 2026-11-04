import type { Metadata } from "next";

import SponsorApplicationsManager from "./components/SponsorApplicationsManager";

export const metadata: Metadata = { title: "Sponsor Applications — Admin" };

export default function SponsorApplicationsPage({
  searchParams,
}: {
  searchParams?: { eventId?: string };
}) {
  const raw = Number(searchParams?.eventId);
  const initialEventId = Number.isInteger(raw) && raw > 0 ? String(raw) : "";

  return <SponsorApplicationsManager initialEventId={initialEventId} />;
}
