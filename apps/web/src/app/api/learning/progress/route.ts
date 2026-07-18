import { NextResponse } from "next/server";

import { progressInputSchema } from "@/core/learning/domain/learning";
import { learningService } from "@/core/learning/learning-container";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const body = progressInputSchema.parse(await request.json());
  const progress = await learningService.updateProgress(session.user.id, body);

  return NextResponse.json({ progress });
}

