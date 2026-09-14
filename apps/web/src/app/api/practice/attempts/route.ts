import { NextResponse } from "next/server";

import { practiceAttemptInputSchema } from "@/core/intelligence/domain/intelligence";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { parseJsonRequest } from "@/lib/parse-json-request";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  const parsed = await parseJsonRequest(request, practiceAttemptInputSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;
  await intelligenceService.recordPracticeAttempt(session.user.id, body);
  return NextResponse.json({ ok: true });
}
