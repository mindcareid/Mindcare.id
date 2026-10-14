import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { AdminRole, UserRole } from "@prisma/client";
import { getAdminUser, countActiveSuperadmins } from "@/lib/adminGuard";
import prisma from "@/lib/prisma";

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
  adminAccess: { select: { role: true, isActive: true } },
} as const;

/* =====================================================
   GET USERS (only active users) — admin only
===================================================== */
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);

  const username = searchParams.get("username") ?? undefined;
  const userId = searchParams.get("userId");
  const role = searchParams.get("role") as UserRole | null;

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
   CREATE USER — admin only
   Role user tidak lagi ditentukan di sini; akses admin
   diatur terpisah lewat /api/cadmin/admin-access.
===================================================== */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

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

  const passwordHash = password ? bcrypt.hashSync(password, 10) : null;

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
   UPDATE USER — admin only
   Field `role` sengaja diabaikan: hak admin bukan lagi
   kolom User.
===================================================== */
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
    }

    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();

    const {
      name,
      email,
      username,
      phoneNumber,
      bio,
      facebook,
      instagram,
      image,
    }: {
      name?: string;
      email?: string;
      username?: string;
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

    // Akun yang masih memegang akses admin tidak boleh diubah admin biasa:
    // mengganti email/username akun berlevel lebih tinggi adalah jalur
    // pengambilalihan. Superadmin dikecualikan.
    const target = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { adminAccess: { select: { isActive: true } } },
    });

    if (!target) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (target.adminAccess?.isActive && admin.role !== AdminRole.SUPERADMIN) {
      return NextResponse.json(
        { message: "Only a superadmin can edit an admin account" },
        { status: 403 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        username,
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
   SOFT DELETE USER — admin only.
   Menghapus akun yang masih memegang akses admin hanya
   boleh superadmin, dan tidak boleh menghabiskan
   superadmin terakhir.
===================================================== */
export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Forbidden!" }, { status: 403 });
  }

  const id = Number(new URL(request.url).searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const target = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: { adminAccess: { select: { role: true, isActive: true } } },
  });

  if (!target) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (target.adminAccess?.isActive) {
    if (admin.role !== AdminRole.SUPERADMIN) {
      return NextResponse.json(
        { message: "Only a superadmin can remove an admin account" },
        { status: 403 }
      );
    }

    if (
      target.adminAccess.role === AdminRole.SUPERADMIN &&
      (await countActiveSuperadmins(id)) === 0
    ) {
      return NextResponse.json(
        { message: "Cannot remove the last active superadmin" },
        { status: 400 }
      );
    }
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
