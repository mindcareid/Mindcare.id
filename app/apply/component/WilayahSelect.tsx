"use client";

import type { ProvinceOption, RegencyOption } from "@/lib/wilayah";
import { ApplyField, applyInputClassName } from "./ApplyField";

export type WilayahSelection = {
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
};

type WilayahSelectProps = {
  provinces: ProvinceOption[];
  regencies: RegencyOption[];
  provinceCode: string;
  cityCode: string;
  onChange: (selection: WilayahSelection) => void;
  provinceError?: string;
  cityError?: string;
  provinceId: string;
  cityId: string;
  disabled?: boolean;
};

/**
 * Dua dropdown bertingkat: Provinsi lalu Kota/Kabupaten. Nilainya berupa kode
 * BPS, sementara nama kanoniknya ikut dikirim supaya form tetap menyimpan
 * pasangan kode + nama. Mengganti provinsi mengosongkan kota, karena kota lama
 * belum tentu berada di provinsi baru.
 */
export default function WilayahSelect({
  provinces,
  regencies,
  provinceCode,
  cityCode,
  onChange,
  provinceError,
  cityError,
  provinceId,
  cityId,
  disabled = false,
}: WilayahSelectProps) {
  const provinceRegencies = provinceCode
    ? regencies.filter((regency) => regency.provinceId === provinceCode)
    : [];

  const emit = (nextProvinceCode: string, nextCityCode: string) => {
    const province =
      provinces.find((entry) => entry.id === nextProvinceCode) ?? null;
    const city = regencies.find((entry) => entry.id === nextCityCode) ?? null;
    onChange({
      provinceCode: nextProvinceCode,
      provinceName: province?.name ?? "",
      cityCode: nextCityCode,
      cityName: city?.name ?? "",
    });
  };

  return (
    <>
      <ApplyField
        label="Province"
        htmlFor={provinceId}
        required
        error={provinceError}
      >
        <select
          id={provinceId}
          value={provinceCode}
          disabled={disabled}
          aria-invalid={provinceError ? true : undefined}
          onChange={(event) => emit(event.target.value, "")}
          className={applyInputClassName(Boolean(provinceError))}
        >
          <option value="">Select a province</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </ApplyField>

      <ApplyField label="City" htmlFor={cityId} required error={cityError}>
        <select
          id={cityId}
          value={cityCode}
          disabled={disabled || !provinceCode}
          aria-invalid={cityError ? true : undefined}
          onChange={(event) => emit(provinceCode, event.target.value)}
          className={applyInputClassName(Boolean(cityError))}
        >
          <option value="">
            {provinceCode ? "Select a city" : "Pick a province first"}
          </option>
          {provinceRegencies.map((regency) => (
            <option key={regency.id} value={regency.id}>
              {regency.name}
            </option>
          ))}
        </select>
      </ApplyField>
    </>
  );
}
