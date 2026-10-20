---
name: wilayah-indonesia
description: Indonesian administrative region data (provinsi, kabupaten/kota) from the EMSIFA static API, plus how this repo stores and serves it for the registration dropdowns. Use when working with province/city selection, region codes, wilayah seed data, or geocoding/maps for Indonesian addresses.
---

# Skill: Wilayah Indonesia

Referensi data wilayah administratif Indonesia (BPS): provinsi, kabupaten/kota,
kecamatan, kelurahan, kode pos, dan polygon batas. Sumber publiknya adalah
static API EMSIFA v2. Dokumen ini menjelaskan bentuk data yang diterima dan
bagaimana repo MindCare.id memakainya.

## 1. Sumber kebenaran di repo ini

Repo ini TIDAK memanggil `www.emsifa.com` saat runtime. Alasannya: form
pendaftaran tidak boleh bergantung pada CDN pihak ketiga, dan nama wilayah dari
EMSIFA tidak selalu sama dengan data lama di DB (lihat bagian Gotcha).

- Skema: `Province { id, name }` dan `Regency { id, name, provinceId }` di
  `prisma/schema.prisma`. `id` adalah kode BPS (`32`, `32.73`).
- Data tersimpan: `prisma/data/wilayah.json` (38 provinsi + 514 kab/kota).
- Ambil/perbarui data mentah: `node scripts/fetch-wilayah.mjs`.
- Isi DB: `npm run seed` (atau `node prisma/seed.mjs`). Idempoten (upsert).
- Backfill baris lama ke kode: `node scripts/backfill-wilayah-codes.mjs`.
- Opsi untuk form: `getWilayahOptions()` di `lib/wilayah.ts` (server only).
- Komponen dropdown: `app/apply/component/WilayahSelect.tsx` (Provinsi lalu
  Kota, controlled, native `<select>`).

Kolom kode di entitas: `CareCentre.cityCode` / `provinceCode` dan
`Professional.baseCityCode` / `baseProvinceCode` (nullable untuk data lama).
Nama kanonik tetap disimpan di kolom `city` / `province` / `baseCity` /
`baseProvince`.

Kalau butuh level kecamatan/kelurahan atau polygon, ambil dari API di bawah,
tetapi jangan fetch langsung dari browser user.

## 2. API statis (kalau perlu data mentah)

Base URL: `https://www.emsifa.com/api-wilayah-indonesia/v2`

Semua response dibungkus:

```json
{
  "data": <object atau array>,
  "meta": { "level": 1, "updated_at": "2026-10-18" }
}
```

- `meta.level`: `0=stats, 1=province, 2=regency, 3=district, 4=village`
- `meta.updated_at`: tanggal file digenerate. Catatan: dokumentasi resmi
  menulis `meta.generated_at`, tetapi respons live memakai `updated_at`.

Endpoint:

| Path | Isi |
|---|---|
| `/provinces.json` | Semua provinsi (objek lengkap) |
| `/provinces/{code}.json` | Satu provinsi, mis. `32` |
| `/regencies/{province_code}.json` | Kab/kota dalam provinsi itu |
| `/regencies/{regency_code}.json` | Satu kab/kota + provinsinya |
| `/districts/{regency_code}.json` | Kecamatan (ringkas) |
| `/villages/{district_code}.json` | Kelurahan + `postal_code` |
| `/postal-codes/{postal_code}.json` | Semua kelurahan dengan kode pos itu |
| `/paths/{code}.json` | Polygon batas (cek `has_path` dulu) |
| `/missings.json` | Wilayah dengan `has_path=false` atau tanpa lat/lng |
| `/stats.json` | Total per level |

Bentuk objek:
- Provinsi/kabupaten: `id, name, capital, lat, lng, elv, tz, population,
  total_area, has_path` (+ parent `province`/`regency` di endpoint detail).
- Kecamatan: `id, name, lat, lng, has_path`.
- Kelurahan: tambah `postal_code`.

Polygon `/paths/{id}.json` berisi `path` yang bisa satu ring (`[[lat,lng],...]`)
atau banyak ring. Tangani keduanya: kalau elemen pertama berupa titik `[lat,lng]`
maka itu satu polygon, kalau array of points maka itu sudah daftar ring.

## 3. Struktur kode dan relasi

- `id`/`kode` adalah primary key. Hitung titik untuk tahu level: tanpa titik =
  provinsi (`11`), satu titik = kab/kota (`11.01`), dua = kecamatan, tiga =
  kelurahan.
- Hierarki selalu provinsi → kabupaten/kota → kecamatan → kelurahan.
- Kode kab/kota selalu diawali kode provinsinya, dipisah titik. Jadi
  `cityCode.startsWith(provinceCode + ".")` adalah invariant yang valid, dan
  dipakai sebagai validasi di `lib/validations/apply.ts`.
- `postal_code` menempel di kelurahan.

## 4. Gotcha

- Nama EMSIFA berbeda dari singkatan umum dan dari data lama repo ini. Contoh:
  `DKI Jakarta` (lama) vs `Daerah Khusus Ibukota Jakarta` (EMSIFA);
  `DI Yogyakarta` vs `Daerah Istimewa Yogyakarta`;
  `Jakarta Selatan` vs `Kota Administrasi Jakarta Selatan`. Karena itu kode
  yang disimpan sebagai sumber kebenaran, dan backfill menormalkan nama lama.
- `lat`/`lng` adalah **centroid wilayah**, bukan lokasi tempat. Jangan dipakai
  sebagai koordinat klinik/praktik; semua entitas di satu kota akan dapat titik
  yang sama. Untuk lokasi asli, geocode alamat atau minta pin di map. Centroid
  cocok hanya sebagai default center viewport peta.
- Cek `has_path` sebelum mengambil `/paths/{id}.json` supaya tidak 404.
- Endpoint live memakai `meta.updated_at`, bukan `meta.generated_at`.

## 5. Referensi

- API: `https://www.emsifa.com/api-wilayah-indonesia/v2`
- Spec: `openapi.yml` dan `wilayah-postman.json` di base URL yang sama
- Alternatif unduhan: `npx wilayah download --format csv|sql|json`
