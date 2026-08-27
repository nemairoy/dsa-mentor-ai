import "server-only";

import { createHash } from "node:crypto";

import { logger } from "@/infrastructure/logging/logger";
import { pool } from "@/infrastructure/database/postgres";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
};

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const bucketKey = createHash("sha256").update(key).digest("hex");
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const resetAt = new Date(windowStart.getTime() + windowMs);

  try {
    const result = await pool.query<{ count: number }>(
      `INSERT INTO api_rate_limit (key, "windowStart", count, "expiresAt")
       VALUES ($1, $2, 1, $3)
       ON CONFLICT (key, "windowStart")
       DO UPDATE SET count = api_rate_limit.count + 1
       RETURNING count`,
      [bucketKey, windowStart, resetAt],
    );

    if (Math.random() < 0.01) {
      void pool.query(`DELETE FROM api_rate_limit WHERE "expiresAt" < NOW()`).catch((error) => {
        logger.warn("Expired rate-limit cleanup failed", { error });
      });
    }

    const count = result.rows[0]?.count ?? limit + 1;
    const allowed = count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - count),
      ...(allowed ? {} : { retryAfterSeconds: Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000)) }),
    };
  } catch (error) {
    logger.error("Distributed rate limiter failed closed", { error });
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }
}
