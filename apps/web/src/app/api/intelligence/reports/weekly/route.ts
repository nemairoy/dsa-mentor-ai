import { NextResponse } from "next/server";

import { contentService } from "@/core/content/content-container";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  const roadmap = await contentService.getRoadmap();
  const report = await intelligenceService.getWeeklyReport(session.user.id, roadmap);
  return NextResponse.json({ report });
}

