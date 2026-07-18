import { NextResponse } from "next/server";

import { ragSearchSchema } from "@/core/rag/domain/rag";
import { env } from "@/infrastructure/config/env";
import { logger } from "@/infrastructure/logging/logger";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const body = ragSearchSchema.parse(await request.json());
  const limit = rateLimit(`rag-search:${session.user.id}`, 120, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ detail: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const response = await fetch(`${env.API_BASE_URL}/api/v1/rag/search`, {
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
