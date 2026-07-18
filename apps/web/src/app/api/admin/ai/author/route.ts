import { NextResponse } from "next/server";

import { adminService } from "@/core/admin/admin-container";
import { aiAuthoringSchema } from "@/core/admin/domain/admin";
import { env } from "@/infrastructure/config/env";
import { validatePromptSafety } from "@/lib/prompt-guard";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  await adminService.requireAdmin(session.user.id, "ai:author");
  const body = aiAuthoringSchema.parse(await request.json());
  const limit = rateLimit(`admin-ai:${session.user.id}`, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ detail: "Rate limit exceeded" }, { status: 429 });
  }
  const safety = validatePromptSafety(body.prompt);
  if (!safety.safe) {
    return NextResponse.json({ detail: safety.reason }, { status: 400 });
  }
  const response = await fetch(`${env.API_BASE_URL}/api/v1/ai/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Student-Id": session.user.id,
    },
    body: JSON.stringify({
      feature: "follow_up",
      chapterSlug: "admin",
      lessonSlug: "cms-authoring",
      lessonTitle: "CMS Authoring",
      lessonMarkdown: "Administrative content authoring request.",
      question: `Feature: ${body.feature}\n\n${body.prompt}`,
    }),
  });
  const payload = await response.json();
  const output = payload.answer ?? payload.detail ?? "";
  await adminService.saveAiAuthoring(session.user.id, body, output);
  return NextResponse.json({ output, model: "gemini-2.5-flash-lite" }, { status: response.status });
}
