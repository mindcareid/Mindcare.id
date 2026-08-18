import { user_gender, user_role } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: user_role;
      photo: string | null;
      phonenumber?: string | null;
      bio?: string | null;
      createAt?: string | null;
      username: string;
      emailVerified: boolean;
      expertId: number | null;
      jobTitle?: string | null;
      jobName?: string | null;
      gender?: user_gender | null;
      companyId?: number | null;
      companyRole?: string | null;
      companyStatus?: string | null;
      companies?: {
        id: number;
        name: string;
        slug: string;
      }[];
    } & DefaultSession["user"];
  }

  //Menambahkan Role Company dan CompanyId
  interface User extends DefaultUser {
    id: string;
    role: user_role;
    phonenumber?: string | null;
    bio?: string | null;
    createAt?: string | null;
    photo?: string | null;
    emailVerified: boolean;
    jobTitle?: string | null;
    jobName?: string | null;
    gender?: user_gender | null;
    companyId?: number | null;
    companies?: {
      id: number;
      name: string;
      slug: string;
    }[];
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: user_role;
    photo: string | null;
    phonenumber?: string | null;
    username: string;
    bio?: string | null;
    jobTitle?: string | null;
    jobName?: string | null;
    gender?: user_gender | null;
    createAt?: string | null;
    emailVerified: boolean;
    expertId: number | null;
    companyId?: number | null;
    companyRole?: string | null;
    companyStatus?: string | null;
    companies?: {
      id: number;
      name: string;
      slug: string;
    }[];
  }
}
