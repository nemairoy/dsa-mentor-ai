import "server-only";

import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const OWNER_ADMIN_COOKIE = "dsa-owner-admin";
export const OWNER_ADMIN_SESSION_SECONDS = 8 * 60 * 60;

function adminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.BETTER_AUTH_SECRET || "";
}

function passwordHash() {
  return process.env.ADMIN_PASSWORD_HASH ?? "";
}

function signature(expiresAt: number) {
  return createHmac("sha256", sessionSecret()).update(`owner-admin:${expiresAt}`).digest("base64url");
}

export function ownerAdminIsConfigured() {
  return Boolean(adminEmail() && passwordHash() && sessionSecret());
}

export function verifyOwnerCredentials(email: string, password: string) {
  if (!ownerAdminIsConfigured()) return false;

  const normalizedEmail = email.trim().toLowerCase();
  const expectedEmail = Buffer.from(adminEmail());
  const suppliedEmail = Buffer.from(normalizedEmail);
  const emailMatches = expectedEmail.length === suppliedEmail.length && timingSafeEqual(expectedEmail, suppliedEmail);

  const [saltHex, expectedHex] = passwordHash().split(":");
  if (!saltHex || !expectedHex || !/^[a-f\d]+$/i.test(saltHex) || !/^[a-f\d]+$/i.test(expectedHex)) return false;

  try {
    const expected = Buffer.from(expectedHex, "hex");
    const supplied = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
    return emailMatches && timingSafeEqual(expected, supplied);
  } catch {
    return false;
  }
}

export function createOwnerAdminToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + OWNER_ADMIN_SESSION_SECONDS;
  return `v1.${expiresAt}.${signature(expiresAt)}`;
}

export function verifyOwnerAdminToken(token: string | undefined) {
  if (!token || !ownerAdminIsConfigured()) return false;
  const [version, expiresValue, suppliedSignature] = token.split(".");
  const expiresAt = Number(expiresValue);
  if (version !== "v1" || !Number.isInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !suppliedSignature) return false;

  const expected = Buffer.from(signature(expiresAt));
  const supplied = Buffer.from(suppliedSignature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export async function hasOwnerAdminSession() {
  return verifyOwnerAdminToken((await cookies()).get(OWNER_ADMIN_COOKIE)?.value);
}

export async function requireOwnerAdmin() {
  if (!(await hasOwnerAdminSession())) redirect("/admin-login");
}
