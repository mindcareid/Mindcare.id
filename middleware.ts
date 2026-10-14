import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  // Gerbang ini hanya memastikan sudah login. Otorisasi admin dibaca dari
  // database di `app/cadmin/layout.tsx` dan tiap route API, karena token di
  // sini bisa basi setelah akses admin dicabut.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/apply/:path*",
    "/profile/:path*",
    "/cadmin/:path*",
    "/my-classes/:path*",
    "/order/:path*",
    "/dashboard/:path*",
  ],
};
