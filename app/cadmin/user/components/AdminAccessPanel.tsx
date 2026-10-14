"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Button from "@/app/components/reusable/Button";

type AdminRole = "ADMIN" | "SUPERADMIN";

type AdminAccess = {
  role: AdminRole;
  isActive: boolean;
} | null;

type Props = {
  userId: number;
  initialAccess: AdminAccess;
};

export default function AdminAccessPanel({ userId, initialAccess }: Props) {
  const { data: session } = useSession();
  const isSuperadmin = session?.user?.adminRole === "SUPERADMIN";
  const isSelf = Number(session?.user?.id) === userId;

  const [access, setAccess] = useState<AdminAccess>(
    initialAccess?.isActive ? initialAccess : null,
  );
  const [role, setRole] = useState<AdminRole>(access?.role ?? "ADMIN");
  const [busy, setBusy] = useState(false);

  const canManage = isSuperadmin && !isSelf;

  const grant = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/cadmin/admin-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.message || "Failed to grant admin access");
        return;
      }
      setAccess({ role, isActive: true });
      toast.success(
        access ? "Admin role updated" : "Admin access granted",
      );
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!confirm("Revoke admin access for this user?")) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/cadmin/admin-access?userId=${userId}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.message || "Failed to revoke admin access");
        return;
      }
      setAccess(null);
      toast.success("Admin access revoked");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Admin Access
      </h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        Admin access is stored in its own table, not as a user role. Only a
        superadmin can change it.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Current:</span>
        {access ? (
          <span className="inline-flex items-center rounded-full bg-brand-lavender-100 px-3 py-1 text-sm font-medium text-secondary">
            {access.role === "SUPERADMIN" ? "Super Admin" : "Admin"}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
            Not an admin
          </span>
        )}
      </div>

      {!isSuperadmin && (
        <p className="text-sm text-muted-foreground">
          Only a superadmin can grant or revoke admin access.
        </p>
      )}

      {isSuperadmin && isSelf && (
        <p className="text-sm text-muted-foreground">
          You cannot change your own admin access here.
        </p>
      )}

      {canManage && (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPERADMIN">Super Admin</option>
            </select>
          </div>

          <Button variant="primary" isLoading={busy} onClick={grant}>
            {access ? "Update role" : "Grant admin access"}
          </Button>

          {access && (
            <Button variant="danger" disabled={busy} onClick={revoke}>
              Revoke
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
