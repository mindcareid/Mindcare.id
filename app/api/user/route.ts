import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/* =====================================================
   GET USERS (only active users)
===================================================== */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const username = searchParams.get("username") ?? undefined;
  const userId = searchParams.get("userId");
  const role = searchParams.get("role") as UserRole | null;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const whereClause: {
    id?: number;
    username?: string;
    role?: UserRole;
    isActive: boolean;
  } = {
    isActive: true,
  };

  if (username) whereClause.username = username;
  if (userId) whereClause.id = Number(userId);
  if (role) whereClause.role = role;

  const selectUser = {
    id: true,
    email: true,
    username: true,
    name: true,
    phoneNumber: true,
    bio: true,
    photo: true,
    publicId: true,
    instagram: true,
    facebook: true,
    role: true,
    isActive: true,
    createdAt: true,
  };

  if (username || userId) {
    const user = await prisma.user.findFirst({
      where: whereClause,
      select: selectUser,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: selectUser,
  });

  return NextResponse.json({ data: users });
}

/* =====================================================
   CREATE USER
===================================================== */
export async function POST(request: NextRequest) {
  const generateRandomString = (length: number): string => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  const body = await request.json();

  const {
    name,
    email,
    password,
    phoneNumber,
    bio,
    facebook,
    instagram,
    image,
  }: {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    bio?: string;
    facebook?: string;
    instagram?: string;
    image?: {
      public_id: string;
      secure_url: string;
    };
  } = body;

  const passwordHash = password
    ? bcrypt.hashSync(password, 10)
    : null;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username: generateRandomString(8),
      password: passwordHash,
      phoneNumber,
      bio,
      facebook,
      instagram,
      publicId: image?.public_id ?? "",
      photo: image?.secure_url ?? "",
      role: UserRole.USER,
      isActive: true,
    },
  });

  return NextResponse.json(
    { message: "User created", user },
    { status: 201 }
  );
}

/* =====================================================
   UPDATE USER
===================================================== */
export async function PUT(request: NextRequest) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();

    const {
      name,
      email,
      username,
      role,
      phoneNumber,
      bio,
      facebook,
      instagram,
      image,
    }: {
      name?: string;
      email?: string;
      username?: string;
      role?: UserRole;
      phoneNumber?: string;
      bio?: string;
      facebook?: string;
      instagram?: string;
      image?: {
        public_id: string;
        secure_url: string;
      };
    } = body;

    if (username) {
      const existing = await prisma.user.findUnique({
        where: { username },
      });

      if (existing && existing.id !== id) {
        return NextResponse.json(
          { message: "Username already taken" },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        username,
        role,
        phoneNumber,
        bio,
        facebook,
        instagram,
        publicId: image?.public_id,
        photo: image?.secure_url,
      },
    });

    return NextResponse.json({
      message: "User updated",
      user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* =====================================================
   SOFT DELETE USER
===================================================== */
export async function DELETE(request: NextRequest) {
  const id = Number(new URL(request.url).searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  return NextResponse.json({
    message: "User deactivated",
    user,
  });
}
