import { NextResponse } from "next/server";

import { aiRequestSchema } from "@/core/ai/domain/ai";
import { logger } from "@/infrastructure/logging/logger";
import { generateWithGeminiFallback } from "@/lib/gemini-fallback";
import { internalApiFetch } from "@/lib/internal-api";
import { validatePromptSafety } from "@/lib/prompt-guard";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const body = aiRequestSchema.parse(await request.json());
  const limit = await rateLimit(`ai:${session.user.id}`, 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ detail: "Rate limit exceeded" }, { status: 429 });
  }
  const safety = validatePromptSafety([body.question, body.code, body.lessonMarkdown].filter(Boolean).join("\n"));
  if (!safety.safe) {
    return NextResponse.json({ detail: safety.reason }, { status: 400 });
  }
  if (isModelIdentityQuestion(body.question)) {
    return NextResponse.json({
      answer: "I am DSA Mentor AI, your DSA learning assistant. I can help explain this lesson, create examples, quiz you, or review your DSA approach.",
      feature: body.feature,
    });
  }

  try {
    const response = await internalApiFetch("/api/v1/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Student-Id": session.user.id,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(7_000),
    });

    const payload = await response.json();
    if (!response.ok && shouldUseGeminiFallback(response.status)) {
      const fallback = await generateWithGeminiFallback(body);
      return NextResponse.json(fallback);
    }

    return NextResponse.json(sanitizeAiPayload(payload), { status: response.status });
  } catch (error) {
    logger.error("AI proxy request failed, using web Gemini fallback", { error });
    try {
      const fallback = await generateWithGeminiFallback(body);
      return NextResponse.json(sanitizeAiPayload(fallback));
    } catch (fallbackError) {
      logger.error("AI fallback request failed", { fallbackError });
      return NextResponse.json({ detail: "AI service is unavailable" }, { status: 503 });
    }
  }
}

function shouldUseGeminiFallback(status: number) {
  return [502, 503, 504].includes(status);
}

function isModelIdentityQuestion(question?: string) {
  if (!question) return false;
  return /\b(are you|who are you|what are you|which model|what model|gemini|google ai|openai|chatgpt|claude|llm|large language model)\b/i.test(question);
}

function sanitizeAiPayload(payload: { answer?: string; detail?: string; [key: string]: unknown }) {
  if (!payload.answer) return payload;
  const leakedIdentity = /\b(large language model|trained by google|gemini|google ai|generative language|openai|chatgpt|claude)\b/i.test(payload.answer);
  if (!leakedIdentity) return payload;
  return {
    ...payload,
    answer: "I am DSA Mentor AI, your DSA learning assistant. I can help explain this lesson, create examples, quiz you, or review your DSA approach.",
  };
}
