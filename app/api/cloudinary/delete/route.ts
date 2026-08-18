// app/api/cloudinary/delete/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const { public_id } = await req.json();

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  // 🔥 1 TIMESTAMP SAJA
  const timestamp = Math.floor(Date.now() / 1000);

  // 🔥 STRING TO SIGN HARUS PERSIS
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${public_id}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("public_id", public_id);
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
