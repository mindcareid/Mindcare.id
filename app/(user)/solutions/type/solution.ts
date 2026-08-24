export type SolutionTheme = "navy" | "purple" | "emerald";

export type DeliveryMode = "Online" | "In Person";

export interface SolutionCategory {
  id: string;
  slug: string;
  name: string;
  theme: SolutionTheme;
}

export interface SolutionFocusArea {
  id: string;
  slug: string;
  name: string;
}

export interface SolutionPartner {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
}

export interface SolutionSession {
  id: string;
  title: string;
  summary: string;
}

export interface Solution {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl: string | null;
  category: SolutionCategory;
  focusAreas: SolutionFocusArea[];
  deliveryModes: DeliveryMode[];
  sessionCount: number;
  sessionMinutes: number;
  priceIdr: number | null;
  overview: string[];
  whoItIsFor: string[];
  curriculum: SolutionSession[];
  leadProfessionalSlug: string | null;
  partners: SolutionPartner[];
  createdAt: string;
}
