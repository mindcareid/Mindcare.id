// lib/utils/generateUsername.ts
import prisma from "@/lib/prisma";

export async function generateUniqueUsername(email: string) {
  const baseUsername = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // bersihin karakter aneh

  let username = baseUsername;
  let counter = 0;

  while (true) {
    const exists = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!exists) break;

    counter++;
    username = `${baseUsername}${counter}`;
  }

  return username;
}
