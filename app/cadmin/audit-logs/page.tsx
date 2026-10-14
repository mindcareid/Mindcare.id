import { redirect } from "next/navigation";
import { getSuperadmin } from "@/lib/adminGuard";
import AuditLogTable from "./components/AuditLogTable";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const superadmin = await getSuperadmin();
  if (!superadmin) redirect("/cadmin");

  return <AuditLogTable />;
}
