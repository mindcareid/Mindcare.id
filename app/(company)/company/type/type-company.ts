export type CompanyData = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  instagram: string | null;
  linkedin: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  isActive: boolean;
  createdAt?: string;
};
