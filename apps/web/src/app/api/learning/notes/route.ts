import { NextResponse } from "next/server";

import { lessonIdentitySchema, noteInputSchema } from "@/core/learning/domain/learning";
import { learningService } from "@/core/learning/learning-container";
import { getCurrentSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const lesson = lessonIdentitySchema.parse({
    chapterSlug: url.searchParams.get("chapterSlug"),
    lessonSlug: url.searchParams.get("lessonSlug"),
  });
  const note = await learningService.getNote(session.user.id, lesson);

  return NextResponse.json({ note });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const body = noteInputSchema.parse(await request.json());
  const note = await learningService.saveNote(session.user.id, body);

  return NextResponse.json({ note });
}

