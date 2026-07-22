import { NextResponse } from "next/server";

import { pool } from "@/infrastructure/database/postgres";

export const runtime = "nodejs";

const requiredEnv = [
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "DATABASE_URL",
] as const;

export async function GET() {
  const env = Object.fromEntries(
    requiredEnv.map((name) => [name, Boolean(process.env[name])]),
  );
  const authUrl = process.env.BETTER_AUTH_URL ?? null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? null;
  const authOrigin = authUrl ? new URL(authUrl).origin : null;
  const appOrigin = appUrl ? new URL(appUrl).origin : null;

  try {
    const result = await pool.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])
       ORDER BY table_name`,
      [["user", "session", "account", "verification"]],
    );

    const tables = new Set(result.rows.map((row) => row.table_name));

    return NextResponse.json({
      ok: requiredEnv.every((name) => env[name]) && tables.size === 4,
      env,
      urls: {
        authUrl,
        appUrl,
        sameOrigin: Boolean(authOrigin && appOrigin && authOrigin === appOrigin),
      },
      database: "connected",
      authTables: {
        user: tables.has("user"),
        session: tables.has("session"),
        account: tables.has("account"),
        verification: tables.has("verification"),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        env,
        database: "error",
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    );
  }
}
