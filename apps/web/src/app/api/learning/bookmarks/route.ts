import { NextResponse } from "next/server";
import { z } from "zod";

import { lessonIdentitySchema } from "@/core/learning/domain/learning";
import { learningService } from "@/core/learning/learning-container";
import { getCurrentSession } from "@/lib/session";

const bookmarkBodySchema = lessonIdentitySchema.extend({
  bookmarked: z.boolean(),
});

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const bookmarks = await learningService.listBookmarks(session.user.id);
  return NextResponse.json({ bookmarks });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const body = bookmarkBodySchema.parse(await request.json());
  await learningService.setBookmark(session.user.id, body, body.bookmarked);

  return NextResponse.json({ bookmarked: body.bookmarked });
}
