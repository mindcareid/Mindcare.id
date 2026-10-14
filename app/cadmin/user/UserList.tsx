"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { buttonStyles } from "@/app/components/reusable/buttonStyles";

type User = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  photo: string | null;
  role: string;
  adminAccess?: {
    role: "ADMIN" | "SUPERADMIN";
    isActive: boolean;
  } | null;
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUsers(data?.data || []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await fetch(`/api/user?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted");
      return;
    }
    const data = await res.json().catch(() => null);
    toast.error(data?.message || "Failed to delete user");
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage accounts. Admin access is granted separately.
          </p>
        </div>
        <Link
          href="/cadmin/user/create"
          className={buttonStyles({ variant: "primary", size: "md" })}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Phone
                </th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  Admin
                </th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-3" colSpan={4}>
                      <div className="h-9 animate-pulse rounded-lg bg-muted/60" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr className="border-t border-border">
                  <td
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                    colSpan={4}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const initial = user.name?.charAt(0).toUpperCase() || "?";
                  return (
                    <tr
                      key={user.id}
                      className="border-t border-border transition hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.photo ? (
                            <Image
                              src={user.photo}
                              width={36}
                              height={36}
                              alt=""
                              className="size-9 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                              {initial}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {user.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {user.phoneNumber || "—"}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        {user.adminAccess?.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-brand-lavender-100 px-2.5 py-1 text-xs font-medium text-secondary">
                            {user.adminAccess.role === "SUPERADMIN"
                              ? "Super Admin"
                              : "Admin"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/cadmin/user/edit/${user.id}`}
                            className={buttonStyles({
                              variant: "outline",
                              size: "sm",
                            })}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            className={buttonStyles({
                              variant: "danger",
                              size: "sm",
                            })}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <p className="mt-3 text-xs text-muted-foreground">
          {filtered.length} of {users.length} users
        </p>
      )}
    </div>
  );
}
