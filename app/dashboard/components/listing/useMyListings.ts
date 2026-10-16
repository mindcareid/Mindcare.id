"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { MY_LISTINGS_QUERY_KEY } from "@/lib/queryKeys";

export type MyListings = {
  professional: boolean;
  careCentre: boolean;
  solution: boolean;
  canCreateEvents: boolean;
};

const EMPTY_LISTINGS: MyListings = {
  professional: false,
  careCentre: false,
  solution: false,
  canCreateEvents: false,
};

async function fetchMyListings(): Promise<MyListings> {
  const res = await fetch("/api/apply/status");
  if (!res.ok) throw new Error("Failed to load listings");

  const json = await res.json();
  const data = json?.data ?? {};

  return {
    professional: Boolean(data.professional),
    careCentre: Boolean(data.careCentre),
    solution: Number(data.solutionCount ?? 0) > 0,
    canCreateEvents: Boolean(data.professional) || Boolean(data.careCentre),
  };
}

export function useMyListings(): MyListings {
  const { status } = useSession();

  const { data } = useQuery({
    queryKey: [MY_LISTINGS_QUERY_KEY],
    queryFn: fetchMyListings,
    enabled: status === "authenticated",
    staleTime: 30_000,
  });

  return data ?? EMPTY_LISTINGS;
}
