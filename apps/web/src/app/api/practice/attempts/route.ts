import { NextResponse } from "next/server";

import { practiceAttemptInputSchema } from "@/core/intelligence/domain/intelligence";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  const body = practiceAttemptInputSchema.parse(await request.json());
  await intelligenceService.recordPracticeAttempt(session.user.id, body);
  return NextResponse.json({ ok: true });
}

