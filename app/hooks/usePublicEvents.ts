"use client";
import { useState, useEffect } from "react";
import { CalendarEvent } from "../components/calendar/type";

const CATEGORY_COLOR: Record<string, string> = {
  Sertifikasi: "bg-blue-500",
  Pelatihan: "bg-green-500",
  Webinar: "bg-orange-400",
  Workshop: "bg-violet-500",
  Default: "bg-gray-400",
};

// Shape dari API publik — sesuaikan dengan backend
interface ApiPublicEvent {
  id: number;
  startDate: string; // "2026-02-19"
  startTime: string; // "09:00"
  name: string;
  type: string; // "Sertifikasi" | "Pelatihan" | dst
}

function mapToCalendarEvent(item: ApiPublicEvent): CalendarEvent {
  return {
    id: item.id,
    date: item.startDate,
    title: item.name,
    category: item.type,
    time: item.startTime,
    color: CATEGORY_COLOR[item.type] ?? CATEGORY_COLOR.Default,
  };
}

export function usePublicEvents(year: number, month: number) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      setError(null);
      try {
        // Ganti dengan endpoint API publik kamu
        // GET /api/events?month=2026-02-01
        const monthParam = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        const res = await fetch(`/api/events?month=${monthParam}`);

        if (!res.ok) throw new Error("Failed to fetch events");

        const data: ApiPublicEvent[] = await res.json();
        setEvents(data.map(mapToCalendarEvent));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [year, month]);

  return { events, isLoading, error };
}
