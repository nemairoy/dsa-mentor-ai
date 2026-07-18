import { createHash, randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { profileService } from "@/core/profile/profile-container";
import { AppError, NotFoundError, UnauthorizedError } from "@/core/shared/errors";
import { logger } from "@/infrastructure/logging/logger";
import { getCurrentSession } from "@/lib/session";

const maxUploadSize = 2 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function uploadDir() {
  return path.join(process.cwd(), "public", "uploads", "profile-pictures");
}

function publicPathFor(fileName: string) {
  return `/uploads/profile-pictures/${fileName}`;
}

function fileNameFor(userId: string, extension: string) {
  const userHash = createHash("sha256").update(userId).digest("hex").slice(0, 16);
  return `${userHash}-${randomUUID()}.${extension}`;
}

async function removeLocalProfilePicture(profilePictureUrl: string | null) {
  if (!profilePictureUrl?.startsWith("/uploads/profile-pictures/")) return;

  const fileName = path.basename(profilePictureUrl);
  const targetPath = path.join(uploadDir(), fileName);

  try {
    await unlink(targetPath);
  } catch {
    // Missing old files should not block profile updates.
  }
}

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

    const extension = allowedTypes.get(photo.type);
    if (!extension) {
      return NextResponse.json({ detail: "Upload a JPG, PNG, or WebP image" }, { status: 422 });
    }

    if (photo.size > maxUploadSize) {
      return NextResponse.json({ detail: "Image must be 2 MB or smaller" }, { status: 422 });
    }

    const directory = uploadDir();
    await mkdir(directory, { recursive: true });

    const fileName = fileNameFor(session.user.id, extension);
    const targetPath = path.join(directory, fileName);
    const bytes = Buffer.from(await photo.arrayBuffer());

    await writeFile(targetPath, bytes);
    await removeLocalProfilePicture(profile.profilePictureUrl);

    const updatedProfile = await profileService.save(session.user.id, {
      fullName: profile.fullName,
      age: profile.age,
      profilePictureUrl: publicPathFor(fileName),
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

    await removeLocalProfilePicture(profile.profilePictureUrl);
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
