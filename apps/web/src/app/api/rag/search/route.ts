import { NextResponse } from "next/server";

import { ragSearchSchema } from "@/core/rag/domain/rag";
import { logger } from "@/infrastructure/logging/logger";
import { internalApiFetch } from "@/lib/internal-api";
import { parseJsonRequest } from "@/lib/parse-json-request";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const parsed = await parseJsonRequest(request, ragSearchSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;
  const limit = await rateLimit(`rag-search:${session.user.id}`, 120, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ detail: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const response = await internalApiFetch("/api/v1/rag/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json(await response.json(), { status: response.status });
  } catch (error) {
    logger.error("RAG search proxy failed", { error });
    return NextResponse.json({ detail: "Search service is unavailable" }, { status: 503 });
  }
}
