import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { profileService } from "@/core/profile/profile-container";
import { AppError, UnauthorizedError } from "@/core/shared/errors";
import { logger } from "@/infrastructure/logging/logger";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const profile = await profileService.getByUserId(session.user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const profile = await profileService.save(session.user.id, body);

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ detail: error.issues[0]?.message ?? "Invalid request" }, { status: 422 });
  }

  if (error instanceof AppError) {
    return NextResponse.json({ detail: error.message }, { status: error.statusCode });
  }

  logger.error("Profile route failed", { error });
  return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
}

