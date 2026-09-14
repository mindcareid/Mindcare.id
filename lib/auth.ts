import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import prisma from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/utils/generateUsername";
import bcrypt from "bcryptjs";

/* ---------------------------------------------------
   Utils
--------------------------------------------------- */
const generateRandomString = (length = 8) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

//Menambahkan CompanyRole dan Company Id untuk session
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
    updateAge: 60 * 60 * 6,
  },

  jwt: {
    maxAge: 60 * 60 * 24,
  },

  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    /* ---------- Credentials ---------- */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email & password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("email or password is incorrect");
        }

        const valid = await bcrypt.compare(credentials.password, user.password);

        if (!valid) {
          throw new Error("email or password is incorrect");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          username: user.username,
          // createAt: user.createdAt?.toISOString(),
          bio: user.bio,
          jobTitle: user.jobTitle,
          jobName: user.jobName,
          gender: user.gender,
          role: user.role,
          photo: user.photo,
          emailVerified: user.emailVerified,
        };
      },
    }),

    /* ---------- Google ---------- */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    /* ---------- GitHub ---------- */
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  callbacks: {
    /* ---------------------------------------------------
       JWT CALLBACK (Single Source of Truth)
    --------------------------------------------------- */
    async jwt({ token, user, account, trigger, session }) {
      // 1️⃣ Session update (AMAN)
      if (trigger === "update") {
        // 1️⃣ update profile fields jika ada
        if (session) {
          token.name = session.name ?? token.name;
          token.bio = session.bio ?? token.bio;
          token.jobTitle = session.jobTitle ?? token.jobTitle;
          token.jobName = session.jobName ?? token.jobName;
          token.gender = session.gender ?? token.gender;
          token.photo = session.photo ?? token.photo;
        }

        // 2️⃣ refresh company dari database
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(token.id) },
          include: {
            companies: {
              include: {
                company: {
                  select: { id: true, name: true, slug: true },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });

        if (dbUser) {
          token.companies = dbUser.companies.map((cu) => ({
            id: cu.company.id,
            name: cu.company.name,
            slug: cu.company.slug,
          }));

          const activeCompany =
            dbUser.companies.find((cu) => cu.status === "ACTIVE") ??
            dbUser.companies.find((cu) => cu.status === "PENDING") ??
            null;
          token.companyId = activeCompany?.company.id ?? null;
          token.companyRole = activeCompany?.role ?? null;
          token.companyStatus = activeCompany?.status ?? null;
        }

        return token;
      }

      // 2️⃣ BUKAN LOGIN → JANGAN SENTUH TOKEN
      if (!user) {
        return token;
      }

      // 3️⃣ LOGIN PERTAMA SAJA
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
          companies: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (account?.provider !== "credentials") {
        if (!user.email) throw new Error("OAuth account has no email");

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? "",
              photo: user.image ?? "",
              publicId: "",
              username: await generateUniqueUsername(user.email),
              role: "USER",
              emailVerified: true,
              emailVerifiedAt: new Date(),
            },
            include: {
              companies: {
                include: {
                  company: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          });
        } else if (!dbUser.emailVerified) {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              emailVerified: true,
              emailVerifiedAt: new Date(),
              emailVerificationToken: null,
              emailVerificationExpires: null,
              emailVerificationAttempts: 0,
            },
            include: {
              companies: {
                include: {
                  company: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          });
        }
      } else {
        dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: {
            companies: {
              include: { company: true },
            },
          },
        });
      }

      if (!dbUser) throw new Error("User not found");

      // 4️⃣ HYDRATE TOKEN SEKALI
      token.id = dbUser.id.toString();
      token.email = dbUser.email;
      token.name = dbUser.name;
      token.phoneNumber = dbUser.phoneNumber;
      token.username = dbUser.username;
      token.bio = dbUser.bio;
      token.jobTitle = dbUser.jobTitle ?? null;
      token.jobName = dbUser.jobName ?? null;
      token.gender = dbUser.gender;
      // token.createAt = dbUser.createdAt?.toISOString();
      token.role = dbUser.role;
      token.photo = dbUser.photo;
      token.emailVerified = dbUser.emailVerified;
      token.companies = dbUser.companies.map((cu) => ({
        id: cu.company.id,
        name: cu.company.name,
        slug: cu.company.slug,
      }));

      // shortcut
      const activeCompany =
        dbUser.companies.find((cu) => cu.status === "ACTIVE") ??
        dbUser.companies.find((cu) => cu.status === "PENDING") ??
        null;

      token.companyId = activeCompany?.company.id ?? null;
      token.companyRole = activeCompany?.role ?? null;
      token.companyStatus = activeCompany?.status ?? null;

      return token;
    },

    /* ---------------------------------------------------
       SESSION CALLBACK
    --------------------------------------------------- */
    async session({ session, token }) {
      if (!session.user) return session;

      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.phoneNumber = token.phoneNumber ?? null;
      session.user.bio = token.bio ?? null;
      session.user.jobTitle = token.jobTitle ?? null;
      session.user.jobName = token.jobName ?? null;
      session.user.gender = token.gender;
      // session.user.createAt = token.createAt ?? null;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.photo = token.photo as string | null;
      session.user.emailVerified = token.emailVerified as boolean;
      session.user.companies = token.companies ?? [];
      session.user.companyId = token.companyId ?? null;
      session.user.companyRole = token.companyRole ?? null;
      session.user.companyStatus = token.companyStatus ?? null;

      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};
