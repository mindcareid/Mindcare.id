import type { Verification } from "../../data/verification";

export type ProfessionKind = "Psikolog" | "Psikiater" | "Konselor";

export type SessionMode = "Online" | "In Person";

export interface AreaOfSupport {
  id: string;
  slug: string;
  name: string;
}

export interface ProfessionalLocation {
  city: string;
  province: string;
}

export interface TherapyApproach {
  id: string;
  slug: string;
  name: string;
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  year: number;
}

export interface ProfessionalService {
  id: string;
  slug: string;
  name: string;
  mode: SessionMode;
  durationMinutes: number;
  priceIdr: number;
}

export interface Professional {
  id: string;
  slug: string;
  fullName: string;
  credentials: string;
  profession: ProfessionKind;
  photoUrl: string | null;
  verification: Verification;
  isAvailableNow: boolean;
  areasOfSupport: AreaOfSupport[];
  sessionModes: SessionMode[];
  location: ProfessionalLocation;
  languages: string[];
  yearsOfExperience: number;
  startingPriceIdr: number;
  createdAt: string;
  headline: string;
  bio: string[];
  approaches: TherapyApproach[];
  education: EducationEntry[];
  services: ProfessionalService[];
  bookingUrl: string | null;
}
export interface ProfessionalFacets {
  professions: ProfessionKind[];
  areasOfSupport: AreaOfSupport[];
  sessionModes: SessionMode[];
  cities: string[];
}

export type ProfessionalSort =
  | "relevance"
  | "experience"
  | "price-asc"
  | "name-asc";
