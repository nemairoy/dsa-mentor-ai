import "server-only";

import { createHash } from "node:crypto";

import { env } from "@/infrastructure/config/env";

function internalApiKey() {
  const secret = process.env.INTERNAL_API_SECRET || env.DATABASE_URL;
  return createHash("sha256").update(`dsa-mentor-ai-internal-api:${secret}`).digest("hex");
}

export function internalApiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("X-Internal-Api-Key", internalApiKey());

  return fetch(`${env.API_BASE_URL}${path}`, {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(20_000),
  });
}
