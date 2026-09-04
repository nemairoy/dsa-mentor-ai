import { NextResponse } from "next/server";
import { z } from "zod";

import { rateLimit } from "@/lib/rate-limit";
import {
  createOwnerAdminToken,
  OWNER_ADMIN_COOKIE,
  OWNER_ADMIN_SESSION_SECONDS,
  ownerAdminIsConfigured,
  verifyOwnerCredentials,
} from "@/lib/owner-admin-auth";

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ detail: "Invalid request origin." }, { status: 403 });
  if (!ownerAdminIsConfigured()) return NextResponse.json({ detail: "Owner admin is not configured." }, { status: 503 });

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ detail: "Enter a valid email and password." }, { status: 400 });

  const clientAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = await rateLimit(`owner-admin-login:${clientAddress}`, 5, 15 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { detail: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 900) } },
    );
  }

  if (!verifyOwnerCredentials(parsed.data.email, parsed.data.password)) {
    return NextResponse.json({ detail: "Invalid admin credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(OWNER_ADMIN_COOKIE, createOwnerAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: OWNER_ADMIN_SESSION_SECONDS,
  });
  return response;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
