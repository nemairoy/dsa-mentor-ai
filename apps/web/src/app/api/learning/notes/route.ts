import { NextResponse } from "next/server";

import { lessonIdentitySchema, noteInputSchema } from "@/core/learning/domain/learning";
import { learningService } from "@/core/learning/learning-container";
import { parseJsonRequest } from "@/lib/parse-json-request";
import { getCurrentSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsedLesson = lessonIdentitySchema.safeParse({
    chapterSlug: url.searchParams.get("chapterSlug"),
    lessonSlug: url.searchParams.get("lessonSlug"),
  });
  if (!parsedLesson.success) {
    return NextResponse.json({ detail: "Enter a valid chapter and lesson" }, { status: 400 });
  }
  const lesson = parsedLesson.data;
  const note = await learningService.getNote(session.user.id, lesson);

  return NextResponse.json({ note });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const parsed = await parseJsonRequest(request, noteInputSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;
  const note = await learningService.saveNote(session.user.id, body);

  return NextResponse.json({ note });
}
