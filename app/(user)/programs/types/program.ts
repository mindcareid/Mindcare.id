import type { IconType } from "react-icons";

export interface Program {
  id: string;
  title: string;
  slug: string;
  icons?: IconType;
  description: string;
  category: string;
  subCategory: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  instructor: string;
  image: string;
  rating: number;
  students: number;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icons: IconType;
  slug: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
}
