import prisma from "@/lib/prisma";

export type ProvinceOption = { id: string; name: string };
export type RegencyOption = { id: string; name: string; provinceId: string };

/**
 * Opsi wilayah untuk dropdown form. Data referensi ini kecil (38 provinsi +
 * 514 kabupaten/kota), jadi keduanya dimuat sekaligus dan dikirim ke client.
 * Hanya dipanggil dari server component.
 */
export async function getWilayahOptions(): Promise<{
  provinces: ProvinceOption[];
  regencies: RegencyOption[];
}> {
  const [provinces, regencies] = await Promise.all([
    prisma.province.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.regency.findMany({
      select: { id: true, name: true, provinceId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { provinces, regencies };
}
