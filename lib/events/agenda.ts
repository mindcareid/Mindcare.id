import type { EventAgendaKind } from "@prisma/client";

/**
 * Taksonomi jenis sesi agenda MindCare — satu sumber untuk admin, API, dan
 * halaman publik (design.md bagian 33).
 *
 * Sebelum ini daftar yang sama ditulis tiga kali (editor, route, halaman
 * publik) dan sudah mulai berbeda: `OTHER` berlabel "Other" di admin tetapi
 * kosong di halaman publik. Jangan menyalin daftar ini; tambahkan di sini.
 *
 * Modul ini tanpa `"use client"` dan tanpa React, supaya route handler boleh
 * mengimpornya.
 */
export type AgendaKindInfo = {
  value: EventAgendaKind;
  label: string;
  /**
   * Sesi ini memang tidak menyebut orang (mis. coffee break), jadi tidak
   * menampilkan pilihan pembicara. Hanya `BREAK` yang begitu: opening dan
   * sambutan justru biasanya diisi pejabat atau pimpinan.
   */
  hidesSpeakers: boolean;
};

export const AGENDA_KINDS: readonly AgendaKindInfo[] = [
  { value: "OPENING", label: "Opening", hidesSpeakers: false },
  { value: "KEYNOTE", label: "Keynote speech", hidesSpeakers: false },
  { value: "PANEL", label: "Panel discussion", hidesSpeakers: false },
  { value: "SOLUTION_PRESENTATION", label: "Solution presentation", hidesSpeakers: false },
  { value: "TALK", label: "Talk", hidesSpeakers: false },
  { value: "DISCUSSION", label: "Discussion", hidesSpeakers: false },
  { value: "BREAK", label: "Break", hidesSpeakers: true },
  { value: "OTHER", label: "Other", hidesSpeakers: false },
];

function infoOf(kind: EventAgendaKind): AgendaKindInfo | undefined {
  return AGENDA_KINDS.find((entry) => entry.value === kind);
}

/** Selalu mengembalikan label: nilai baru yang belum terdaftar tampil apa adanya. */
export function agendaKindLabel(kind: EventAgendaKind): string {
  return infoOf(kind)?.label ?? kind;
}

/**
 * `true` kalau sesi berjenis ini tidak menyebut orang. Nilai tak dikenal
 * dianggap menyebut orang (paling aman: kolom keterangan tidak dibuang).
 */
export function agendaKindHidesSpeakers(kind: EventAgendaKind): boolean {
  return infoOf(kind)?.hidesSpeakers ?? false;
}

/* =====================================================
 * Peran orang di dalam satu sesi
 * =====================================================
 *
 * Peran melekat pada (sesi, orang), bukan pada orangnya: orang yang sama bisa
 * menjadi moderator di satu sesi dan pembicara di sesi lain. Daftarnya tetap
 * (bukan teks bebas) supaya halaman publik bisa mengelompokkan nama dan tidak
 * ada salah ejaan seperti "moderator" vs "Moderator".
 */

export type AgendaSpeakerRole = "SPEAKER" | "MODERATOR" | "PANELIST" | "HOST";

export type AgendaSpeakerRoleInfo = {
  value: AgendaSpeakerRole;
  /** Label untuk admin. */
  label: string;
  /** Label untuk halaman publik, dipakai sebagai awalan daftar nama. */
  publicLabel: string;
};

export const AGENDA_SPEAKER_ROLES: readonly AgendaSpeakerRoleInfo[] = [
  { value: "SPEAKER", label: "Speaker", publicLabel: "Speaker" },
  { value: "MODERATOR", label: "Moderator", publicLabel: "Moderator" },
  { value: "PANELIST", label: "Panelist", publicLabel: "Panelist" },
  { value: "HOST", label: "Host", publicLabel: "Host" },
];

export const DEFAULT_AGENDA_SPEAKER_ROLE: AgendaSpeakerRole = "SPEAKER";

export function isAgendaSpeakerRole(value: unknown): value is AgendaSpeakerRole {
  return AGENDA_SPEAKER_ROLES.some((role) => role.value === value);
}

export function agendaSpeakerRoleLabel(role: string): string {
  return (
    AGENDA_SPEAKER_ROLES.find((entry) => entry.value === role)?.publicLabel ??
    role
  );
}
