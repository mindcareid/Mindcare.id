// types.ts

export interface CalendarEvent {
  id: number;
  date: string; // "YYYY-MM-DD"
  title: string;
  category: string;
  time: string; // "HH:MM"
  color: string; // tailwind bg class, e.g. "bg-pink-500"
  description?: string;
}

export interface MonthYear {
  year: number;
  month: number; // 0-indexed
}

export interface MonthYearPickerProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
  onClose: () => void;
}

export type CalendarMode = "user" | "public";

export interface ScheduleCalendarProps {
  mode: CalendarMode;
  events: CalendarEvent[];
  isLoading?: boolean;
  categories?: string[];
  onMonthChange?: (year: number, month: number) => void;
  showUrlQuery?: boolean; // false untuk navbar/popup mode
  title?: string;
  subtitle?: string;
}
