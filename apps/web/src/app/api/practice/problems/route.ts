import { NextResponse } from "next/server";

import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { getCurrentSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  const url = new URL(request.url);
  const problems = await intelligenceService.listPracticeProblems(session.user.id, {
    chapterSlug: url.searchParams.get("chapterSlug") ?? undefined,
    lessonSlug: url.searchParams.get("lessonSlug") ?? undefined,
    difficulty: url.searchParams.get("difficulty") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });

  return NextResponse.json({ problems });
}
