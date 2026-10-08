export type SolutionTheme = "navy" | "purple" | "emerald";

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
export interface SolutionAudience {
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

export interface Solution {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl: string | null;
  category: SolutionCategory;
  focusAreas: SolutionFocusArea[];
  deliveryModes: string[];
  overview: string[];
  whoItIsFor: string[];
  leadProfessionalSlug: string | null;
  partners: SolutionPartner[];
  createdAt: string;

  organizationName: string;
  logoUrl: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  audiences: SolutionAudience[];
}
