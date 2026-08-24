export type CentreKind =
  | "Klinik"
  | "Rumah Sakit"
  | "Puskesmas"
  | "Pusat Konseling";

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
  isVerified: boolean;
  isOpenNow: boolean;
  openingHours: string;
  services: CentreService[];
  address: CentreAddress;
  coordinates: CentreCoordinates;
  phone: string;
  acceptsBpjs: boolean;
  professionalCount: number;
  createdAt: string;
}

export interface CareCentreFacets {
  kinds: CentreKind[];
  services: CentreService[];
  cities: string[];
}
