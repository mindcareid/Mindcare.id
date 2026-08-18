"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/FormatDate";

type Company = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  location: string | null;
  createdAt: string;
  users: {
    id: number;
    status: string;
    user: {
      id: number;
      name: string;
      email: string;
      phonenumber: string | null;
    };
  }[];
};

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-600",
};

export default function CompanyAcceptPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      const res = await fetch(`/api/cadmin/companies?status=${filter}`);
      const json = await res.json();
      setCompanies(json.data ?? []);
      setLoading(false);
    };
    fetch_();
  }, [filter]);

  const handleAction = async (
    companyId: number,
    action: "APPROVE" | "REJECT",
  ) => {
    setProcessing(companyId);
    try {
      const res = await fetch(`/api/cadmin/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success(
        action === "APPROVE" ? "Company approved!" : "Company rejected",
      );
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Approval</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve company registrations
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {["PENDING", "ACTIVE", "DECLINED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No {filter.toLowerCase()} companies
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => {
            const owner = company.users[0];
            return (
              <div
                key={company.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Company Info */}
                  <div className="flex items-center gap-4">
                    {company.logo ? (
                      <Image
                        src={company.logo}
                        alt={company.name}
                        width={56}
                        height={56}
                        className="rounded-xl object-contain border border-gray-100 p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                        {company.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {company.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[owner?.status ?? "PENDING"]}`}
                        >
                          {owner?.status}
                        </span>
                      </div>
                      {company.location && (
                        <p className="text-sm text-gray-500">
                          📍 {company.location}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        Submitted {formatDate(company.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {owner?.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(company.id, "APPROVE")}
                        disabled={processing === company.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(company.id, "REJECT")}
                        disabled={processing === company.id}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Owner Info */}
                {owner && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-400">Owner</p>
                      <p className="font-medium text-gray-800">
                        {owner.user.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <a
                        href={`mailto:${owner.user.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {owner.user.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p>{owner.user.phonenumber ?? "-"}</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                {company.description && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-3 text-sm text-gray-600 line-clamp-2">
                    {company.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
