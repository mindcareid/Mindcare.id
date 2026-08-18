"use client";

import { useState, useEffect } from "react";
import { CalendarEvent } from "../components/calendar/type";

const CATEGORY_COLOR: Record<string, string> = {
  Fitness: "bg-pink-500",
  Yoga: "bg-violet-500",
  Pilates: "bg-teal-500",
  Nutrition: "bg-orange-400",
  Meditation: "bg-purple-500",
  Default: "bg-blue-500",
};

// Shape yang datang dari API kamu — sesuaikan dengan response backend
interface ApiUserSchedule {
  id: number;
  scheduledAt: string; // ISO string, e.g. "2026-02-19T08:00:00Z"
  training: {
    title: string;
    category: { name: string };
  };
}

function mapToCalendarEvent(item: ApiUserSchedule): CalendarEvent {
  const date = new Date(item.scheduledAt);
  const dateStr = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const timeStr = date.toTimeString().slice(0, 5); // "HH:MM"
  const cat = item.training.category.name;

  return {
    id: item.id,
    date: dateStr,
    title: item.training.title,
    category: cat,
    time: timeStr,
    color: CATEGORY_COLOR[cat] ?? CATEGORY_COLOR.Default,
  };
}

export function useUserSchedule(year: number, month: number) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      setIsLoading(true);
      setError(null);
      try {
        // Ganti dengan endpoint API kamu
        // GET /api/user/schedules?month=2026-02-01
        const monthParam = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        const res = await fetch(`/api/user/schedules?month=${monthParam}`, {
          credentials: "include", // kirim cookie/token
        });

        if (!res.ok) throw new Error("Failed to fetch schedule");

        const data: ApiUserSchedule[] = await res.json();
        setEvents(data.map(mapToCalendarEvent));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSchedule();
  }, [year, month]);

  return { events, isLoading, error };
}
