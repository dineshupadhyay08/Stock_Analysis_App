import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Public routes only
  const isPublic =
    pathname === "/auth/sign-in" ||
    pathname === "/auth/sign-up" ||
    pathname === "/" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/auth/verify-reset-code" ||
    pathname === "/auth/reset-password" ||
    pathname === "/auth/change-password";
  if (isPublic) return NextResponse.next();

  // All other routes require authentication
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
