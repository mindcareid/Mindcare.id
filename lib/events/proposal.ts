import { EventFormat, EventAgendaKind } from "@prisma/client";

import prisma from "@/lib/prisma";
import { mailConfig } from "@/lib/mail/config";
import { PdfService, type ProposalAgendaRow } from "@/lib/pdf";
import { toEventPlainText } from "@/lib/events/serializers";
import {
  formatDate,
  formatTimeOnly,
  getTimeZoneLabel,
} from "@/lib/utils/FormatDate";
import { PLATFORM_NAME } from "@/lib/events/constants";
import { isCloudinaryRawAssetUrl } from "@/lib/cloudinary/asset";

export const PROPOSAL_EVENT_WHERE = {
  publisherType: "PLATFORM" as const,
  status: "PUBLISHED" as const,
  deletedAt: null,
};

export type ProposalDocument = {
  buffer: Buffer;
  fileName: string;
  source: "ATTACHED" | "GENERATED";
  warning?: string;
};

/** Detail event yang ikut ditampilkan di badan email. */
export type ProposalEventSummary = {
  eventTitle: string;
  date: string;
  time: string;
  location: string;
};

const MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;

const FORMAT_LABEL: Record<EventFormat, string> = {
  ONLINE: "Online",
  IN_PERSON: "In person",
  HYBRID: "Hybrid",
};

const AGENDA_KIND_LABEL: Partial<Record<EventAgendaKind, string>> = {
  OPENING: "Opening",
  KEYNOTE: "Keynote",
  PANEL: "Panel",
  SOLUTION_PRESENTATION: "Solution presentation",
  TALK: "Talk",
  DISCUSSION: "Discussion",
  BREAK: "Break",
  OTHER: "",
};

export function safeFileName(value: string, fallback = "proposal"): string {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  return cleaned || fallback;
}

/**
 * Ambil file proposal untuk satu event.
 *
 * Kalau admin sudah meng-upload PDF, file itu yang dipakai (proposal asli
 * dari tim lain dikirim apa adanya). Kalau belum, dibuat PDF ringkasan dari
 * data event supaya pengunjung tetap menerima dokumen.
 */
export async function loadProposalDocument(
  eventId: number,
): Promise<{ event: ProposalEventSummary; document: ProposalDocument } | null> {
  const event = await prisma.event.findFirst({
    where: { ...PROPOSAL_EVENT_WHERE, id: eventId },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      format: true,
      startDate: true,
      endDate: true,
      timeZone: true,
      coverImage: true,
      proposalUrl: true,
      platform: { select: { name: true } },
      agenda: {
        orderBy: { sortOrder: "asc" },
        select: {
          title: true,
          kind: true,
          startTime: true,
          endTime: true,
          speakers: {
            orderBy: { sortOrder: "asc" },
            select: { speaker: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!event) {
    return null;
  }

  const baseName = safeFileName(event.title);
  const timeZone = event.timeZone || "Asia/Jakarta";

  const summary: ProposalEventSummary = {
    eventTitle: event.title,
    date: formatDate(event.startDate, timeZone),
    time: `${formatTimeOnly(event.startDate, timeZone)} – ${formatTimeOnly(
      event.endDate,
      timeZone,
    )} ${getTimeZoneLabel(event.startDate, timeZone)}`,
    location: event.location ?? (event.format === "ONLINE" ? "Online" : "-"),
  };

  let attachedWarning: string | undefined;

  if (event.proposalUrl) {
    try {
      const buffer = await fetchProposalFile(event.proposalUrl);
      return {
        event: summary,
        document: {
          buffer,
          fileName: `${baseName}.pdf`,
          source: "ATTACHED",
        },
      };
    } catch (error) {
      // File hilang/tidak bisa diambil bukan alasan menggagalkan form:
      // pengunjung tetap dapat PDF ringkasan. Penyebabnya tetap dicatat
      // dan ikut tersimpan ke baris lead (lihat `documentWarning`).
      console.error("[PROPOSAL_FETCH_ATTACHED]", error);
      attachedWarning = `Uploaded proposal could not be used: ${
        error instanceof Error ? error.message : "unknown error"
      }. A generated summary was sent instead.`.slice(0, 500);
    }
  }

  const agenda: ProposalAgendaRow[] = event.agenda.map((item) => {
    const kind = AGENDA_KIND_LABEL[item.kind] ?? "";
    const names = item.speakers.map((entry) => entry.speaker.name);
    const time = `${formatTimeOnly(item.startTime, timeZone)} – ${formatTimeOnly(
      item.endTime,
      timeZone,
    )}`;

    return {
      time,
      title: kind ? `${item.title} (${kind})` : item.title,
      speakers: names.length > 0 ? names.join(", ") : undefined,
    };
  });

  const buffer = await PdfService.generateProposal({
    eventTitle: event.title,
    coverImage: event.coverImage ?? undefined,
    date: summary.date,
    time: summary.time,
    location: summary.location,
    format: FORMAT_LABEL[event.format],
    description: toEventPlainText(event.description) || "-",
    agenda,
    organizers: event.platform?.name ?? PLATFORM_NAME,
    contactEmail: mailConfig.supportEmail,
  });

  return {
    event: summary,
    document: {
      buffer,
      fileName: `${baseName}.pdf`,
      source: "GENERATED",
      warning: attachedWarning,
    },
  };
}

/**
 * Ambil PDF dari Cloudinary. Dokumen bisa besar, jadi ukuran dibatasi dan
 * request diberi timeout.
 *
 * URL-nya WAJIB lolos allow-list sebelum di-fetch. `proposalUrl` berasal dari
 * input admin, dan tanpa pengecekan ini server bisa diarahkan mengambil
 * alamat internal (metadata cloud, layanan internal) — SSRF. Isinya pun lalu
 * dilampirkan ke email keluar. Aturan ini ditegakkan lagi di sini, bukan
 * hanya saat menyimpan, karena baris lama di database bisa saja sudah berisi
 * URL lain.
 */
async function fetchProposalFile(url: string): Promise<Buffer> {
  if (!isCloudinaryRawAssetUrl(url)) {
    throw new Error("Proposal URL is not a Cloudinary asset");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    // `redirect: "error"` menutup celah redirect ke host internal: sebuah
    // aset Cloudinary tidak perlu redirect.
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "error",
    });

    if (!res.ok) {
      throw new Error(`Proposal file returned ${res.status}`);
    }

    const length = Number(res.headers.get("content-length") ?? "0");
    if (length > MAX_DOWNLOAD_BYTES) {
      throw new Error("Proposal file is too large");
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    if (buffer.byteLength > MAX_DOWNLOAD_BYTES) {
      throw new Error("Proposal file is too large");
    }

    // Pastikan yang diunduh memang PDF, bukan halaman HTML error.
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      throw new Error("Proposal file is not a PDF");
    }

    return buffer;
  } finally {
    clearTimeout(timer);
  }
}
