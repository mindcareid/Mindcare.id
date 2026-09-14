export type Event = {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  startDate: Date;
  endDate: Date;
  timeZone: string;
  location: string | null;
  price: number;
  quota: number | null;
  category: { name: string; slug: string };
  remaining?: number | null;
  soldOut?: boolean;
};

export type Company = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  isActive: boolean;
  location: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  linkedin: string | null;
};

export type FilterType = "upcoming" | "ongoing" | "past";
