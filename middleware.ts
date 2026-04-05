import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getRouteProtectionRedirect } from "@/modules/auth/server/route-protection";

const sessionCookieNames = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.session-token"
] as const;

function hasSessionCookie(request: NextRequest) {
  return sessionCookieNames.some((cookieName) => request.cookies.has(cookieName));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep middleware cheap and Edge-safe. Actual session validation still happens
  // on the server through Auth.js helpers in protected layouts and routes.
  const isAuthenticated = hasSessionCookie(request);

  const redirectPath = getRouteProtectionRedirect(pathname, isAuthenticated);

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*", "/login", "/signup"]
};
