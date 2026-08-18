import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

export type SubCategory = {
  name: string;
  path: string;
};

export type DropdownItem = {
  name: string;
  path: string;
  subCategories?: SubCategory[];
};
export type Menudata = {
  title: string;
  link: string;
  dropdown?: DropdownItem[];
};

export type FooterSection = {
  title: string;
  items?: {
    name: string;
    path: string;
    isAuthRedirect?: boolean;
  }[];

  social?: {
    icon: IconType;
    link: string;
  }[];
};

export type Contact = {
  icon: LucideIcon;
  title?: string;
  label: string;
  href: string;
};
