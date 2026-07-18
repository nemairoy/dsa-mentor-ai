import { NextResponse } from "next/server";

import { ragQuerySchema } from "@/core/rag/domain/rag";
import { env } from "@/infrastructure/config/env";
import { logger } from "@/infrastructure/logging/logger";
import { validatePromptSafety } from "@/lib/prompt-guard";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const body = ragQuerySchema.parse(await request.json());
  const limit = rateLimit(`rag-query:${session.user.id}`, 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ detail: "Rate limit exceeded" }, { status: 429 });
  }
  const safety = validatePromptSafety(body.question);
  if (!safety.safe) {
    return NextResponse.json({ detail: safety.reason }, { status: 400 });
  }

  try {
    const response = await fetch(`${env.API_BASE_URL}/api/v1/rag/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Student-Id": session.user.id,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(await response.json(), { status: response.status });
  } catch (error) {
    logger.error("RAG query proxy failed", { error });
    return NextResponse.json({ detail: "RAG service is unavailable" }, { status: 503 });
  }
}
