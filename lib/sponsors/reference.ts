import { randomInt } from "node:crypto";

import prisma from "@/lib/prisma";

/*
 * ============================================================
 * NOMOR REFERENSI PENGAJUAN SPONSOR
 * ============================================================
 *
 * Bentuk: SPN-2026-11-8F3KQD
 *   SPN     kode dokumen (SPoNsorship)
 *   2026-11 bulan pengajuan
 *   8F3KQD  kode acak 6 huruf — tanpa 0/O, 1/I/L supaya tidak salah baca
 *           waktu disalin dari email ke dokumen tim sponsor
 *
 * Kenapa acak, bukan urutan (00001, 00002):
 * - nomor urut membocorkan berapa banyak sponsor yang sudah masuk, dan
 *   dua pengajuan berurutan bisa ditebak dari yang satu ke yang lain;
 * - nomor ini dicetak di email yang tidak bisa ditarik lagi, jadi tidak boleh
 *   bentrok walau dua orang submit di milidetik yang sama.
 *
 * Keunikannya TETAP dijaga database lewat `referenceNo @unique`. Kalau
 * kebetulan bentrok, fungsi ini mencoba lagi dengan kode berbeda.
 */

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 5;

function randomCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}

export function buildReferenceNo(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `SPN-${year}-${month}-${randomCode()}`;
}

/**
 * Buat nomor yang belum dipakai. `exists` bisa diganti di test/harness tanpa
 * database; bawaan memeriksa tabel pengajuan sponsor.
 */
export async function generateSponsorReferenceNo(
  date: Date = new Date(),
  exists?: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const isTaken =
    exists ??
    (async (candidate: string) =>
      (await prisma.eventSponsorApplication.count({
        where: { referenceNo: candidate },
      })) > 0);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const candidate = buildReferenceNo(date);
    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  throw new Error(
    "Could not generate a unique sponsor reference number after several attempts",
  );
}
