import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const configuredPasscode = process.env.APP_PASSCODE?.trim();

  // If APP_PASSCODE is not set, the gate is disabled
  if (!configuredPasscode) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Paths exempt from gate
  if (
    pathname === "/" ||
    pathname === "/gate" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.svg"
  ) {
    return NextResponse.next();
  }

  const isUnlocked = request.cookies.get("slate_gate_unlocked")?.value === "true";

  if (!isUnlocked) {
    const gateUrl = new URL("/gate", request.url);
    gateUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(gateUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, favicon, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
