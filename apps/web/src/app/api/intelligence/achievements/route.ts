import { NextResponse } from "next/server";

import { contentService } from "@/core/content/content-container";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  const roadmap = await contentService.getRoadmap();
  const achievements = await intelligenceService.getAchievements(session.user.id, roadmap);
  return NextResponse.json({ achievements });
}

