import { Info } from "lucide-react";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import StatusDot from "@/app/components/reusable/StatusDot";
import { cn } from "@/lib/utils";
import {
  CENTRE_DAYS,
  WEEKDAY_LABELS,
  centreZoneLabel,
  formatOpeningRange,
  hoursForWeekday,
  isOpenAt,
  weekdayAt,
} from "../data/centreHours";
import type { CareCentre } from "../type/careCentre";

// Tabel tujuh baris. Selalu tujuh, termasuk hari tutup — daftar yang cuma memuat
// hari buka memaksa pembaca menyimpulkan sisanya, dan "Minggu tidak disebut"
// terbaca sama saja dengan "Minggu lupa diisi".
//
// Barisnya dirender dari `CENTRE_DAYS`, bukan dari `centre.openingHours.map()`.
// Bedanya kelihatan justru ketika datanya rusak: kalau suatu hari sebuah centre
// kehilangan satu entri, versi ini tetap menampilkan tujuh baris dengan satu
// bertanda "—" alih-alih diam-diam menampilkan enam baris yang tampak lengkap.
// Harness menjaga supaya keadaan itu tidak sampai lolos, tapi UI-nya tidak boleh
// bergantung pada harness untuk tampil benar.

type CentreHoursProps = {
  centre: CareCentre;
  /** Acuan waktu tunggal dari `page.tsx`, ISO string. */
  now: string;
  className?: string;
};

export default function CentreHours({
  centre,
  now,
  className,
}: CentreHoursProps) {
  const today = weekdayAt(centre, now);
  const open = isOpenAt(centre, now);
  const zone = centreZoneLabel(centre);

  return (
    <div className={className}>
      <SectionHeader
        title="Opening hours"
        description={
          zone === ""
            ? undefined
            : `All times are local to ${centre.address.city} (${zone}).`
        }
        underline
      />

      <dl className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {CENTRE_DAYS.map((day) => {
          const entry = hoursForWeekday(centre, day);
          const isToday = day === today;

          return (
            <div
              key={day}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 px-5 py-4",
                // Baris hari ini diberi latar, bukan huruf tebal saja: tabelnya
                // dibaca sambil mencari satu baris, dan latar lebih cepat
                // ditemukan mata daripada perbedaan ketebalan huruf.
                isToday && "bg-brand-mint-100",
              )}
            >
              <dt
                className={cn(
                  "text-sm text-muted-foreground",
                  isToday && "font-semibold text-foreground",
                )}
              >
                {WEEKDAY_LABELS[day]}
                {isToday && (
                  <span className="ml-2 text-[13px] font-medium text-accent">
                    Today
                  </span>
                )}
              </dt>

              <dd className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-sm tabular-nums",
                    entry && entry.opens !== null
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {entry === null ? "—" : formatOpeningRange(entry)}
                </span>
                {/* Titik status hanya di baris hari ini, dan hanya kalau memang
                    sedang buka. Di baris hari lain ia akan berarti "buka pada
                    hari Kamis", yang bukan informasi yang ditanyakan siapa pun. */}
                {isToday && open && <StatusDot status="open" label="Open now" />}
              </dd>
            </div>
          );
        })}
      </dl>

      {centre.openingNote && (
        <div className="mt-4 flex max-w-prose gap-3 rounded-xl border border-border bg-muted p-4">
          <Info
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {centre.openingNote}
          </p>
        </div>
      )}
    </div>
  );
}
