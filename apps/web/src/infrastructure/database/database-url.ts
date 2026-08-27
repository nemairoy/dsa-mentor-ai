import "server-only";

import { env } from "@/infrastructure/config/env";

export function resolvedDatabaseUrl() {
  if (!env.DATABASE_POOLER_HOST) return env.DATABASE_URL;

  const url = new URL(env.DATABASE_URL);
  const match = /^db\.([^.]+)\.supabase\.co$/.exec(url.hostname);
  if (!match) return env.DATABASE_URL;

  url.username = `postgres.${match[1]}`;
  url.hostname = env.DATABASE_POOLER_HOST;
  url.port = String(env.DATABASE_POOLER_PORT);
  return url.toString();
}
