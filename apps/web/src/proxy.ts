import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/profile-setup",
    "/learn/:path*",
    "/bookmarks",
    "/visualizations/:path*",
    "/practice",
    "/intelligence",
    "/admin/:path*",
    "/ai-tutor",
    "/notes",
    "/progress",
    "/achievements",
    "/profile",
    "/settings",
  ],
};
