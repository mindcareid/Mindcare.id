import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canDestroyPublicId } from "@/lib/cloudinary/asset";

export async function POST(req: Request) {
  // Endpoint ini menandatangani permintaan destroy dengan API secret, jadi
  // ia wajib tahu siapa yang meminta. Tanpa cek sesi di bawah, siapa pun
  // (termasuk yang tidak login) bisa menghapus aset mana pun di cloud kita.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  // Kompatibel dengan dua bentuk payload yang dipakai konsumen:
  // { public_id } dan { publicId }. Sebelumnya hanya public_id dibaca
  // sehingga panggilan dengan { publicId } menjadi no-op diam-diam.
  const publicId: string | undefined = body?.public_id ?? body?.publicId;

  if (!publicId) {
    return NextResponse.json(
      { message: "Public Id Required" },
      { status: 400 },
    );
  }

  // Permintaan dari klien tidak menentukan aset mana yang boleh dihapus.
  if (!canDestroyPublicId(publicId, session.user.role)) {
    return NextResponse.json(
      { message: "You cannot delete this asset" },
      { status: 403 },
    );
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  // 🔥 1 TIMESTAMP SAJA
  const timestamp = Math.floor(Date.now() / 1000);

  // 🔥 STRING TO SIGN HARUS PERSIS
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  console.log("Cloudinary delete response:", data);

  return NextResponse.json(data);
}
