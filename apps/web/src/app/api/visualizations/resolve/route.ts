import { NextResponse } from "next/server";
import { z } from "zod";

import { animationIntentResolver } from "@/core/visualization/ai/animation-intent-resolver";
import { getCurrentSession } from "@/lib/session";

const bodySchema = z.object({
  query: z.string().min(1).max(1000),
});

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });
  }

  const body = bodySchema.parse(await request.json());
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

