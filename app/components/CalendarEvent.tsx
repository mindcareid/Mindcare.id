"use client";

// components/navbar/NavbarCalendar.tsx
// Contoh penggunaan di navbar untuk menampilkan event/sertifikasi publik

import { useState } from "react";
import ScheduleCalendar from "./calendar/ScheduleCalendar";
import { usePublicEvents } from "../hooks/usePublicEvents";

const PUBLIC_CATEGORIES = ["Sertifikasi", "Pelatihan", "Webinar", "Workshop"];

export default function NavbarCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Fetch dari API public events
  const { events, isLoading } = usePublicEvents(year, month);

  return (
    <div className="w-screen p-4">
      <ScheduleCalendar
        mode="public"
        events={events}
        isLoading={isLoading}
        categories={PUBLIC_CATEGORIES}
        showUrlQuery={false} // URL TIDAK berubah (ini popup navbar)
        onMonthChange={(y, m) => {
          // re-fetch saat ganti bulan
          setYear(y);
          setMonth(m);
        }}
      />
    </div>
  );
}
