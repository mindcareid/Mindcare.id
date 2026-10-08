"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type MyListings = {
  professional: boolean;
  careCentre: boolean;
  solution: boolean;
  canCreateEvents: boolean;
};

export function useMyListings(): MyListings {
  const { data: session, status } = useSession();
  const [listings, setListings] = useState<MyListings>({
    professional: false,
    careCentre: false,
    solution: false,
    canCreateEvents: false,
  });

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    let cancelled = false;
    fetch("/api/apply/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.data) return;
        setListings({
          professional: Boolean(json.data.professional),
          careCentre: Boolean(json.data.careCentre),
          solution: Number(json.data.solutionCount ?? 0) > 0,
          canCreateEvents:
            Boolean(json.data.professional) ||
            Boolean(json.data.careCentre) ||
            Number(json.data.solutionCount ?? 0) > 0,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id]);

  return listings;
}
