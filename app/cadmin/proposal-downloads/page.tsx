import ProposalDownloadsManager from "./components/ProposalDownloadsManager";

export const metadata = { title: "Proposal Downloads — Admin" };

export default function ProposalDownloadsPage({
  searchParams,
}: {
  searchParams?: { eventId?: string };
}) {
  const raw = Number(searchParams?.eventId);
  const initialEventId = Number.isInteger(raw) && raw > 0 ? String(raw) : "";

  return <ProposalDownloadsManager initialEventId={initialEventId} />;
}
