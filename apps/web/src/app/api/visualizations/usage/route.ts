import { NextResponse } from "next/server";

import { visualizationUsageInputSchema } from "@/core/intelligence/domain/intelligence";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  const body = visualizationUsageInputSchema.parse(await request.json());
  await intelligenceService.recordVisualizationUsage(session.user.id, body);
  return NextResponse.json({ ok: true });
}

