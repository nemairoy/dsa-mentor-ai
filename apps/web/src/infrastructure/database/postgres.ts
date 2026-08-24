import { Pool } from "pg";

import { env } from "@/infrastructure/config/env";

const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
};

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: env.DATABASE_SSL_VERIFY } : undefined,
    max: Number(process.env.PG_POOL_MAX ?? 3),
    connectionTimeoutMillis: 3_000,
    idleTimeoutMillis: 10_000,
    statement_timeout: 5_000,
    query_timeout: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
