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
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }
  if (pathname.startsWith("/cadmin")) {
    const role = token.role?.toString().toLowerCase();
    const allowedRoles = ["admin", "superadmin"];

    if (!allowedRoles.includes(role ?? "")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/company")) {
    const publicCompanyRoutes = ["/company/create"];
    const isPublicRoute = publicCompanyRoutes.some((route) =>
      pathname.startsWith(route),
    );

    const companyRole = token.companyRole;
    const companyStatus = token.companyStatus as string | null;

    if (!companyRole && !isPublicRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (companyRole) {
      if (companyStatus === "PENDING") {
        if (!pathname.startsWith("/company/pending")) {
          return NextResponse.redirect(
            new URL("/company/pending", request.url),
          );
        }
      } else if (companyStatus === "DECLINED") {
        if (!isPublicRoute) {
          return NextResponse.redirect(new URL("/company/create", request.url));
        }
      } else if (companyStatus === "ACTIVE") {
        if (pathname.startsWith("/company/create-event")) {
          if (companyRole !== "OWNER" && companyRole !== "ADMIN") {
            return NextResponse.redirect(
              new URL("/company/dashboard", request.url),
            );
          }
          return NextResponse.next();
        }
        if (
          pathname.startsWith("/company/create") ||
          pathname.startsWith("/company/pending")
        ) {
          return NextResponse.redirect(
            new URL("/company/dashboard", request.url),
          );
        }
      } else {
        if (!isPublicRoute) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/cadmin/:path*",
    "/my-classes/:path*",
    "/order/:path*",
    "/dashboard/:path*",
    "/company/:path*",
  ],
};
