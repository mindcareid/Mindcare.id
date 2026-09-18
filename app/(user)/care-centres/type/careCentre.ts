import type { Verification } from "../../data/verification";

export type CentreKind =
  | "Klinik"
  | "Rumah Sakit"
  | "Puskesmas"
  | "Pusat Konseling";
export type CentreWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CentreOpeningHours {
  day: CentreWeekday;
  opens: string | null;
  closes: string | null;
}

export interface CentreService {
  id: string;
  slug: string;
  name: string;
}

export interface CentreAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface CentreCoordinates {
  latitude: number;
  longitude: number;
}

export interface CareCentre {
  id: string;
  slug: string;
  name: string;
  kind: CentreKind;
  photoUrl: string | null;
  verification: Verification;
  openingHours: CentreOpeningHours[];
  openingNote: string | null;
  timeZone: string;
  services: CentreService[];
  address: CentreAddress;
  coordinates: CentreCoordinates | null;
  phone: string;
  acceptsBpjs: boolean;
  professionalSlugs: string[];
  professionalCount: number;
  createdAt: string;
}

export interface CareCentreFacets {
  kinds: CentreKind[];
  services: CentreService[];
  cities: string[];
}
