import { IconType } from "react-icons";

export type UserRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "USER"
  | "INSTITUTION"
  | "PENDING_INSTITUTION";

export interface User {
  id: string;
  email: string;
  name: string;
  phonenumber?: string | null;
  username: string;
  createAt?: string | null;
  bio?: string | null;
  image?: string;
  gender?: string | null;
  jobTitle?: string | null;
  jobName?: string | null;
  emailVerified?: boolean;
  photo?: string | null;
  companyRole?: string | null;
  companyStatus?: string | null;
  role: UserRole;
  avatar?: string;
  companyId?: number | null;
  companies?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export type MenuItems = {
  name: string;
  path: string;
  icon: IconType;
};
