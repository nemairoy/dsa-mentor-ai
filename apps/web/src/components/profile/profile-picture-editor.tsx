"use client";

import { Camera, Save, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type ProfilePictureEditorProps = {
  fullName: string;
  currentProfilePictureUrl?: string | null;
};

const maxOriginalSize = 2 * 1024 * 1024;
const maxUploadSize = 750 * 1024;
const avatarSize = 512;

export function ProfilePictureEditor({ fullName, currentProfilePictureUrl }: ProfilePictureEditorProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const initials = useMemo(
    () =>
      fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "U",
    [fullName],
  );

  useEffect(() => () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
  }, []);

  function chooseFile() {
    inputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setServerError(null);
    setSavedMessage(null);

    if (!file) {
      setSelectedFile(null);
      setSelectedPreviewUrl(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setServerError("Choose a JPG, PNG, or WebP image");
      event.target.value = "";
      return;
    }

    if (file.size > maxOriginalSize) {
      setServerError("Image must be 2 MB or smaller");
      event.target.value = "";
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    setIsPreparing(true);

    try {
      const compressedFile = await compressProfilePhoto(file);
      if (compressedFile.size > maxUploadSize) {
        setServerError("Image could not be compressed enough. Choose a smaller photo.");
        event.target.value = "";
        return;
      }

      const objectUrl = URL.createObjectURL(compressedFile);
      objectUrlRef.current = objectUrl;
      setSelectedFile(compressedFile);
      setSelectedPreviewUrl(objectUrl);
      setPreviewFailed(false);
    } catch {
      setServerError("Unable to prepare this image. Try another JPG, PNG, or WebP photo.");
      event.target.value = "";
    } finally {
      setIsPreparing(false);
    }
  }

  async function savePhoto() {
    if (!selectedFile) {
      setServerError("Choose a photo first");
      return;
    }

    setIsSaving(true);
    setServerError(null);
    setSavedMessage(null);

    const formData = new FormData();
    formData.append("photo", selectedFile);

    const response = await fetch("/api/profile/photo", {
      method: "POST",
      body: formData,
    });

    setIsSaving(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
      setServerError(payload?.detail ?? "Unable to upload profile photo");
      return;
    }

    setSelectedFile(null);
    setSelectedPreviewUrl(null);
    setSavedMessage("Profile photo saved");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    router.refresh();
  }

  async function removePhoto() {
    setIsSaving(true);
    setServerError(null);
    setSavedMessage(null);

    const response = await fetch("/api/profile/photo", {
      method: "DELETE",
    });

    setIsSaving(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
      setServerError(payload?.detail ?? "Unable to remove profile photo");
      return;
    }

    setSelectedFile(null);
    setSelectedPreviewUrl(null);
    setSavedMessage("Profile photo removed");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    router.refresh();
  }

  const displayUrl = selectedPreviewUrl ?? currentProfilePictureUrl ?? null;
  const showImage = displayUrl && !previewFailed;

  return (
    <div className="rounded-xl border border-border bg-background/70 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt={`${fullName} profile photo`}
                className="h-full w-full object-cover"
                onError={() => setPreviewFailed(true)}
              />
            ) : (
              initials
            )}
            <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border border-background bg-card text-muted-foreground shadow-sm">
              <Camera aria-hidden={true} size={14} />
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Profile photo</h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
              Choose a photo from your device. JPG, PNG, or WebP up to 2 MB.
            </p>
            {selectedFile ? <p className="mt-1 truncate text-xs text-emerald-700 dark:text-emerald-300">{selectedFile.name}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void handleFileChange(event)} />
          <Button type="button" variant="outline" size="sm" onClick={chooseFile} disabled={isSaving || isPreparing}>
            <Upload aria-hidden={true} size={14} />
            {isPreparing ? "Preparing..." : "Edit profile photo"}
          </Button>
          <Button type="button" size="sm" onClick={() => void savePhoto()} disabled={isSaving || isPreparing || !selectedFile}>
            <Save aria-hidden={true} size={14} />
            {isSaving ? "Saving..." : "Save photo"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void removePhoto()} disabled={isSaving || isPreparing || (!currentProfilePictureUrl && !selectedFile)}>
            <Trash2 aria-hidden={true} size={14} />
            Remove
          </Button>
        </div>
      </div>

      {serverError ? <p className="mt-3 text-xs text-destructive">{serverError}</p> : null}
      {savedMessage ? <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-300">{savedMessage}</p> : null}
    </div>
  );
}

async function compressProfilePhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, avatarSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const preferredType = file.type === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, preferredType, 0.82);
  });

  if (!blob) throw new Error("Image compression failed");

  const extension = preferredType === "image/png" ? "png" : "webp";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "profile-photo";
  return new File([blob], `${baseName}.${extension}`, {
    type: preferredType,
    lastModified: Date.now(),
  });
}
