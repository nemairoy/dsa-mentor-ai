import { NextResponse } from "next/server";
import { z } from "zod";

import { animationIntentResolver } from "@/core/visualization/ai/animation-intent-resolver";
import { parseJsonRequest } from "@/lib/parse-json-request";
import { getCurrentSession } from "@/lib/session";

const bodySchema = z.object({
  query: z.string().min(1).max(1000),
});

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const parsed = await parseJsonRequest(request, bodySchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;
  const animation = animationIntentResolver.resolve(body.query);

  if (!animation) {
    return NextResponse.json({ animation: null });
  }

  return NextResponse.json({
    animation: {
      ...animation,
      href: `/visualizations/${animation.id}`,
    },
  });
}
