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
  if (pathname.startsWith("/cadmin")) {
    const role = token.role?.toString().toLowerCase();
    const allowedRoles = ["admin", "superadmin"];

    if (!allowedRoles.includes(role ?? "")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

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
