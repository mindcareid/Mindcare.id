"use client";

import { useEffect, useState } from "react";

export type CompanyRole = "OWNER" | "ADMIN" | "TRAINER" | "FINANCE";

type CompanyMember = {
  role: CompanyRole | null;
  isLoading: boolean;
  error: string | null;
  canManageEvent: boolean;
  canEditDescription: boolean;
  canEditPrice: boolean;
};

//Use Company Role Hooks
export function useCompanyRole(companyId: string | number): CompanyMember {
  const [role, setRole] = useState<CompanyRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;

    const fetchRole = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/company/${companyId}/members/me`);
        if (!res.ok) throw new Error("Failed to fetch role");
        const data = await res.json();
        setRole(data.role);
      } catch (err) {
        setError("failed get data role");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [companyId]);

  return {
    role,
    isLoading,
    error,
    canManageEvent: role === "OWNER" || role === "ADMIN",
    canEditDescription:
      role === "OWNER" || role === "ADMIN" || role === "TRAINER",
    canEditPrice: role === "OWNER" || role === "ADMIN" || role === "FINANCE",
  };
}
