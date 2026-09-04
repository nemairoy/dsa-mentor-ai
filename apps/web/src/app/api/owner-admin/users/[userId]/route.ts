import { NextResponse } from "next/server";
import { z } from "zod";

import { pool } from "@/infrastructure/database/postgres";
import { hasOwnerAdminSession } from "@/lib/owner-admin-auth";

const paramsSchema = z.object({ userId: z.string().min(1).max(128) });

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  if (!(await hasOwnerAdminSession())) return NextResponse.json({ detail: "Owner authentication is required." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ detail: "Invalid request origin." }, { status: 403 });

  const parsedParams = paramsSchema.safeParse(await context.params);
  const formData = await request.formData();
  const blocked = formData.get("blocked") === "true";
  if (!parsedParams.success) return NextResponse.json({ detail: "Invalid user ID." }, { status: 400 });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE "user"
       SET "banned" = $2, "banReason" = CASE WHEN $2 THEN 'Blocked by project owner' ELSE NULL END,
           "banExpires" = NULL, "updatedAt" = NOW()
       WHERE id = $1
       RETURNING id`,
      [parsedParams.data.userId, blocked],
    );
    if (!result.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ detail: "User was not found." }, { status: 404 });
    }
    if (blocked) await client.query(`DELETE FROM "session" WHERE "userId" = $1`, [parsedParams.data.userId]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  return NextResponse.redirect(new URL("/admin-console", request.url), 303);
}
