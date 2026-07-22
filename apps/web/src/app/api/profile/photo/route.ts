import { NextResponse } from "next/server";

import { profileService } from "@/core/profile/profile-container";
import { AppError, NotFoundError, UnauthorizedError } from "@/core/shared/errors";
import { logger } from "@/infrastructure/logging/logger";
import { getCurrentSession } from "@/lib/session";

const maxUploadSize = 750 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpeg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const profile = await profileService.getByUserId(session.user.id);
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    const formData = await request.formData();
    const photo = formData.get("photo");

    if (!(photo instanceof File)) {
      return NextResponse.json({ detail: "Choose an image file" }, { status: 422 });
    }

    const imageType = allowedTypes.get(photo.type);
    if (!imageType) {
      return NextResponse.json({ detail: "Upload a JPG, PNG, or WebP image" }, { status: 422 });
    }

    if (photo.size > maxUploadSize) {
      return NextResponse.json({ detail: "Image must be 750 KB or smaller after compression" }, { status: 422 });
    }

    const bytes = Buffer.from(await photo.arrayBuffer());
    const profilePictureUrl = `data:image/${imageType};base64,${bytes.toString("base64")}`;

    const updatedProfile = await profileService.save(session.user.id, {
      fullName: profile.fullName,
      age: profile.age,
      profilePictureUrl,
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const profile = await profileService.getByUserId(session.user.id);
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    const updatedProfile = await profileService.save(session.user.id, {
      fullName: profile.fullName,
      age: profile.age,
      profilePictureUrl: undefined,
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    return handleRouteError(error);
  }
}

function handleRouteError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ detail: error.message }, { status: error.statusCode });
  }

  logger.error("Profile photo route failed", { error });
  return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
}
