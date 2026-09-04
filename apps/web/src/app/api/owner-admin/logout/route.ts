import { NextResponse } from "next/server";

import { OWNER_ADMIN_COOKIE } from "@/lib/owner-admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin-login", request.url), 303);
  response.cookies.set(OWNER_ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
