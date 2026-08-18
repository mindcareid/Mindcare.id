"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { FiUserPlus, FiTrash2, FiSearch } from "react-icons/fi";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";

type Member = {
  id: number;
  role: string;
  status: string;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    photo: string | null;
  };
};

const ROLES = ["ADMIN", "TRAINER"];

const STATUS_TEXT_COLOR: Record<string, string> = {
  ACTIVE: "text-green-600",
  PENDING: "text-yellow-600",
  DECLINED: "text-red-500",
};

const STATUS_DOT_COLOR: Record<string, string> = {
  ACTIVE: "bg-green-500",
  PENDING: "bg-yellow-400 animate-pulse",
  DECLINED: "bg-red-400",
};

const AVATAR_RING_COLOR: Record<string, string> = {
  ACTIVE: "ring-green-200",
  PENDING: "ring-yellow-200",
  DECLINED: "ring-red-100",
};

const ROLE_COLOR: Record<string, string> = {
  OWNER: "bg-amber-50 text-amber-600 border border-amber-200",
  ADMIN: "bg-blue-50 text-blue-600 border border-blue-200",
  TRAINER: "bg-purple-50 text-purple-600 border border-purple-200",
  FINANCE: "bg-gray-50 text-gray-600 border border-gray-200",
};

export default function AddUserCompany() {
  const [members, setMembers] = useState<Member[]>([]);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [role, setRole] = useState("TRAINER");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [companyId, setCompanyId] = useState<number | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  /* ================= GET COMPANY ================= */

  useEffect(() => {
    fetch("/api/company")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.id) {
          setCompanyId(json.data.id);
        }
      });
  }, []);

  /* ================= FETCH MEMBERS ================= */

  const fetchMembers = useCallback(async () => {
    if (companyId == null) return;

    setFetching(true);

    try {
      const res = await fetch(`/api/company/${companyId}/members`);
      const json = await res.json();

      setMembers(json.data ?? []);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setFetching(false);
    }
  }, [companyId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMembers();
  }, [fetchMembers]);

  /* ================= INVITE USER ================= */

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId || !usernameOrEmail.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/company/${companyId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmail,
          role,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to send invitation");
      }

      toast.success("Invitation sent successfully");

      setUsernameOrEmail("");

      await fetchMembers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to send invitation");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= REMOVE MEMBER ================= */

  const handleRemove = (memberId: number) => {
    setSelectedMemberId(memberId);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!companyId || !selectedMemberId) return;

    setConfirmOpen(false);

    try {
      const res = await fetch(
        `/api/company/${companyId}/members/${selectedMemberId}`,
        {
          method: "DELETE",
        },
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to remove member");
      }

      toast.success("Member removed successfully");

      await fetchMembers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to remove member");
      }
    } finally {
      setSelectedMemberId(null);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="mx-auto max-w-7xl px-4 my-12">
      {/* ===== INVITE FORM ===== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Invite Team Member
        </h2>

        <p className="text-sm text-gray-500 mb-5">
          Invite a user using their username or email.
        </p>

        <form
          onSubmit={handleInvite}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />

            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Username or email..."
              required
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none bg-white"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {loading ? (
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                  className="opacity-75"
                />
              </svg>
            ) : (
              <FiUserPlus size={16} />
            )}
            Invite
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 shadow-sm hover:shadow-lg overflow-hidden my-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Company Members
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({members.length})
            </span>
          </h2>
        </div>

        {fetching ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No members yet. Invite someone to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {members.map((member) => (
              <li
                key={member.id}
                className="group px-5 py-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative w-11 h-11 rounded-xl overflow-hidden ring-2 ${AVATAR_RING_COLOR[member.status]}`}
                  >
                    {member.user.photo ? (
                      <Image
                        src={member.user.photo}
                        alt={member.user.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 text-white font-bold text-sm">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {member.user.name}
                      </p>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${ROLE_COLOR[member.role]}`}
                      >
                        {member.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-gray-400">
                        @{member.user.username}
                      </p>

                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold ${STATUS_TEXT_COLOR[member.status]}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLOR[member.status]}`}
                        />
                        {member.status}
                      </span>
                    </div>
                  </div>

                  {member.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      title="Remove member"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove Member?"
        message="This member will be removed from the company and will lose access. This action cannot be undone."
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={handleConfirmRemove}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedMemberId(null);
        }}
      />
    </div>
  );
}
