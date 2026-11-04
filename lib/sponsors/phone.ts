/*
 * ============================================================
 * NEGARA PEMILIK NOMOR TELEPON
 * ============================================================
 *
 * Satu implementasi, dipakai klien DAN server.
 *
 * Sebelumnya form punya salinan sendiri (`phoneDialCode()` di SponsorForm)
 * yang menerima 6–15 digit dan memilih kode terpanjang di antara SEMUA negara,
 * sementara server hanya menguji kode milik negara terpilih dengan batas 7–15
 * digit. Untuk nomor 6 digit keduanya bisa berbeda pendapat, dan yang paling
 * berbahaya: nomor dengan kode satu digit (US "+1", Rusia "+7") diterima
 * sebagai nomor negara mana pun asalkan berawalan angka itu.
 *
 * `libphonenumber-js` (sudah dipakai form kontak) memberi jawaban yang benar:
 * ia mem-parsing nomor E.164 dengan rencana penomoran tiap negara. Contoh:
 *   "+6281234567890" → ID, valid
 *   "+1234567"       → tidak valid (bukan nomor NANP yang mungkin)
 */

import { parsePhoneNumberFromString } from "libphonenumber-js";

/** Nomor E.164: "+" + kode negara + beberapa digit. */
export const E164_PATTERN = /^\+\d{7,15}$/;

/**
 * Kode ISO negara pemilik nomor, atau null bila nomor tidak valid.
 *
 * Nomor yang bentuknya benar tapi tidak valid untuk rencana penomoran
 * negaranya (mis. "+1234567") juga mengembalikan null — itu memang yang
 * diinginkan, karena nomor seperti itu tidak akan pernah bisa dihubungi tim
 * sponsor.
 */
export function phoneCountryCode(phone: string): string | null {
  if (!E164_PATTERN.test(phone)) return null;

  const parsed = parsePhoneNumberFromString(phone);
  if (!parsed || !parsed.isValid() || !parsed.country) return null;

  return parsed.country;
}

/**
 * Apakah nomor ini masuk ke negara `countryCode`?
 *
 * `callingCodes` opsional: dipakai untuk negara yang punya beberapa kode
 * panggil (mis. Åland: "18" dan "358"). Bila daftarnya diberikan, kode panggil
 * nomor harus salah satu milik negara itu.
 */
export function phoneMatchesCountry(
  phone: string,
  countryCode: string,
  callingCodes?: (string | null)[] | null,
): boolean {
  if (phoneCountryCode(phone) === countryCode) return true;

  const allowed = (callingCodes ?? [])
    .flatMap((code) => (code ?? "").split(","))
    .map((code) => code.trim())
    .filter(Boolean);

  return allowed.some((code) => phone.startsWith(`+${code}`));
}

/**
 * Apakah nomor ini punya kode panggil yang dimiliki `callingCodes`?
 *
 * Dipakai server saat nomor harus cocok dengan negara yang dipilih PIC,
 * tanpa memaksa libphonenumber mengenali negaranya (rentan untuk nomor uji
 * sintetis).
 */
export function phoneStartsWithAnyDialCode(
  phone: string,
  callingCodes?: (string | null)[] | null,
): boolean {
  const allowed = (callingCodes ?? [])
    .flatMap((code) => (code ?? "").split(","))
    .map((code) => code.trim())
    .filter(Boolean);

  return allowed.some((code) => phone.startsWith(`+${code}`));
}
