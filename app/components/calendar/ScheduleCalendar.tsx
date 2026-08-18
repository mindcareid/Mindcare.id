"use client";

// components/calendar/ScheduleCalendar.tsx

import { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaArrowRight, FaChevronDown } from "react-icons/fa";
import {
  CalendarEvent,
  MonthYear,
  MonthYearPickerProps,
  ScheduleCalendarProps,
} from "./type";

// ─── Constants ───────────────────────────────────────────────────────────────
const DAYS: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS_SHORT: string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTHS_FULL: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseQuery(): MonthYear | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("month");
  if (!raw) return null;
  const [y, m] = raw.split("-").map(Number);
  if (!y || !m) return null;
  return { year: y, month: m - 1 };
}

function pushQuery(year: number, month: number): void {
  const val = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const url = new URL(window.location.href);
  url.searchParams.set("month", val);
  window.history.pushState({}, "", url.toString());
}

function getDaysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

function getFirstDay(y: number, m: number): number {
  return new Date(y, m, 1).getDay();
}

function fmt(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// ─── MonthYearPicker ─────────────────────────────────────────────────────────
function MonthYearPicker({
  year,
  month,
  onChange,
  onClose,
}: MonthYearPickerProps) {
  const [pickerYear, setPickerYear] = useState<number>(year);

  return (
    <div className="absolute left-0 top-12 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 w-64">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setPickerYear((y) => y - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 font-bold"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {pickerYear}
        </span>
        <button
          onClick={() => setPickerYear((y) => y + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 font-bold"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {MONTHS_SHORT.map((m, i) => {
          const isActive = i === month && pickerYear === year;
          return (
            <button
              key={m}
              onClick={() => {
                onChange(pickerYear, i);
                onClose();
              }}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="min-h-28 border-r border-b border-gray-100 p-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 animate-pulse mb-2" />
          <div className="h-4 bg-gray-100 animate-pulse rounded-md w-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Main ScheduleCalendar ────────────────────────────────────────────────────
export default function ScheduleCalendar({
  mode,
  events,
  isLoading = false,
  categories = [],
  onMonthChange,
  showUrlQuery = true,
  title = "Schedules",
  subtitle = "Schedule of your various activities.",
}: ScheduleCalendarProps) {
  const today = new Date();

  // Init dari URL query atau hari ini
  const initFromQuery = showUrlQuery ? parseQuery() : null;
  const init: MonthYear = initFromQuery ?? {
    year: today.getFullYear(),
    month: today.getMonth(),
  };

  const [year, setYear] = useState<number>(init.year);
  const [month, setMonth] = useState<number>(init.month);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("All categories");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function navigate(y: number, m: number): void {
    setYear(y);
    setMonth(m);
    if (showUrlQuery) pushQuery(y, m);
    setSelectedDate(null);
    onMonthChange?.(y, m); // notify parent → parent bisa re-fetch API
  }

  function prevMonth(): void {
    month === 0 ? navigate(year - 1, 11) : navigate(year, month - 1);
  }

  function nextMonth(): void {
    month === 11 ? navigate(year + 1, 0) : navigate(year, month + 1);
  }

  // Filter by category
  const allCategories = ["All categories", ...categories];
  const filteredEvents: CalendarEvent[] = events.filter(
    (e) => category === "All categories" || e.category === category,
  );

  const eventsForDate = (d: string): CalendarEvent[] =>
    filteredEvents.filter((e) => e.date === d);

  // Build calendar grid
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = Array.from(
    { length: totalCells },
    (_, i) => {
      const d = i - firstDay + 1;
      return d >= 1 && d <= daysInMonth ? d : null;
    },
  );

  const isToday = (d: number): boolean =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const selectedEvents: CalendarEvent[] = selectedDate
    ? eventsForDate(selectedDate)
    : [];

  // Unique categories from events for dynamic filter
  const uniqueCategories =
    allCategories.length > 1
      ? allCategories
      : [
          "All categories",
          ...Array.from(new Set(events.map((e) => e.category))),
        ];

  return (
    <div className="flex-1 overflow-auto">
      {/* Page title — hanya di mode user/fullpage */}
      {mode === "user" && (
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3 relative" ref={pickerRef}>
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <FaArrowLeft className="w-3 h-3" />
            </button>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <FaArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => setShowPicker((v) => !v)}
              className="flex items-center gap-1.5 text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors"
            >
              {MONTHS_FULL[month]} {year}
              <FaChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showPicker && (
              <MonthYearPicker
                year={year}
                month={month}
                onChange={(y, m) => navigate(y, m)}
                onClose={() => setShowPicker(false)}
              />
            )}
          </div>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setCategory(e.target.value)
            }
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            {uniqueCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* ── Detail info bar ── */}
        <div className="px-7 py-3 border-b border-gray-100 min-h-13 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-gray-400">
            Detail information:
          </span>
          {selectedEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5"
            >
              <div className={`w-2 h-2 rounded-full ${ev.color}`} />
              <span className="text-xs font-semibold text-gray-800">
                {ev.title}
              </span>
              <span className="text-xs text-gray-400">{ev.time}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-medium text-white ${ev.color}`}
              >
                {ev.category}
              </span>
            </div>
          ))}
        </div>

        {/* ── Day headers ── */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-gray-500 py-3 border-r border-gray-100 last:border-r-0"
            >
              {d}
            </div>
          ))}
        </div>

        {/* ── Calendar grid ── */}
        {isLoading ? (
          <CalendarSkeleton />
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dateStr = day ? fmt(year, month, day) : null;
              const dayEvents = dateStr ? eventsForDate(dateStr) : [];
              const todayCell = day !== null && isToday(day);
              const selected = dateStr !== null && dateStr === selectedDate;

              return (
                <div
                  key={i}
                  onClick={() =>
                    day !== null && setSelectedDate(selected ? null : dateStr)
                  }
                  className={[
                    "min-h-28 border-r border-b border-gray-100 last:border-r-0 p-2 transition-colors",
                    day === null ? "bg-gray-50/40" : "",
                    todayCell ? "bg-yellow-50" : "",
                    selected ? "bg-blue-50/50" : "",
                    day !== null && !todayCell && !selected
                      ? "hover:bg-gray-50 cursor-pointer"
                      : "",
                  ].join(" ")}
                >
                  {day !== null && (
                    <>
                      <div
                        className={[
                          "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs mb-1 font-medium",
                          todayCell
                            ? "bg-yellow-300 font-bold text-gray-900"
                            : "",
                          selected ? "bg-blue-600 text-white font-bold" : "",
                          !todayCell && !selected ? "text-gray-700" : "",
                        ].join(" ")}
                      >
                        {day}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate ${ev.color}`}
                          >
                            {ev.time} {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[10px] text-gray-400 pl-1">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Legend (auto dari events) ── */}
      <div className="flex gap-5 mt-4 flex-wrap">
        {Array.from(new Set(events.map((e) => e.category))).map((cat) => {
          const color =
            events.find((e) => e.category === cat)?.color ?? "bg-gray-400";
          return (
            <div key={cat} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-xs text-gray-500">{cat}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
