import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// contoh handler login
const isPasswordMatch = async (plainPassword: string, hashedPassword: string | null) => {
    if (!hashedPassword) return false; // kalau null langsung return false
    return await bcrypt.compare(plainPassword, hashedPassword);
  };

export async function POST(req: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await req.json();
    console.log(userId, currentPassword, newPassword);

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "User ID, current password, and new password are required" },
        { status: 400 }
      );
    }

    const id = Number(userId);
    if (isNaN(id)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Cari user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const valid = await isPasswordMatch(currentPassword, user.password);

    if (!valid) {
        return NextResponse.json(
            { message: "Current password is incorrect" },
            { status: 400 }
          );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
