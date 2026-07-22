import { Pool } from "pg";

import { env } from "@/infrastructure/config/env";

const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
};

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.PG_POOL_MAX ?? 3),
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
