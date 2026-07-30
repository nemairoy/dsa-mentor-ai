"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Save, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { profileSchema, type ProfileFormValues, type ProfileInput } from "@/core/profile/domain/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { announceRouteTransition } from "@/components/loading/route-transition";
import {
  compressProfilePhoto,
  maxCompressedProfilePhotoSize,
  maxOriginalProfilePhotoSize,
} from "@/components/profile/profile-picture-editor";

type ProfileSetupFormProps = {
  defaultFullName?: string | null;
  defaultProfilePictureUrl?: string | null;
};

export function ProfileSetupForm({ defaultFullName, defaultProfilePictureUrl }: ProfileSetupFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProfileFormValues, unknown, ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      fullName: defaultFullName ?? "",
      age: undefined,
      profilePictureUrl: defaultProfilePictureUrl ?? "",
    },
  });
  const fullName = useWatch({ control, name: "fullName" });
  const profilePictureUrl = useWatch({ control, name: "profilePictureUrl" });
  const displayUrl = selectedPreviewUrl ?? profilePictureUrl ?? null;
  const showImage = Boolean(displayUrl && !previewFailed);
  const initials = useMemo(
    () =>
      (fullName || defaultFullName || "Student")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "S",
    [defaultFullName, fullName],
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
    setPreviewFailed(false);

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setServerError("Choose a JPG, PNG, or WebP photo.");
      event.target.value = "";
      return;
    }

    if (file.size > maxOriginalProfilePhotoSize) {
      setServerError("Photo must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    setIsPreparingPhoto(true);

    try {
      const compressedFile = await compressProfilePhoto(file);
      if (compressedFile.size > maxCompressedProfilePhotoSize) {
        setServerError("This photo is still too large after compression. Choose a smaller image.");
        event.target.value = "";
        return;
      }

      const dataUrl = await fileToDataUrl(compressedFile);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const objectUrl = URL.createObjectURL(compressedFile);
      objectUrlRef.current = objectUrl;
      setSelectedPreviewUrl(objectUrl);
      setSelectedFileName(compressedFile.name);
      setValue("profilePictureUrl", dataUrl, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    } catch {
      setServerError("Unable to prepare this photo. Try another JPG, PNG, or WebP image.");
      event.target.value = "";
    } finally {
      setIsPreparingPhoto(false);
    }
  }

  async function onSubmit(values: ProfileInput) {
    setServerError(null);

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
      setServerError(payload?.detail ?? "Unable to save profile");
      return;
    }

    announceRouteTransition();
    router.push("/dashboard");
    router.refresh();
  }

  const canSubmit = isValid && !isSubmitting && !isPreparingPhoto && Boolean(profilePictureUrl);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <input type="hidden" {...register("profilePictureUrl")} />

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayUrl ?? ""}
                  alt="Selected profile photo"
                  className="h-full w-full object-cover"
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                initials
              )}
              <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border border-background bg-card text-muted-foreground shadow-sm">
                <Camera aria-hidden={true} size={15} />
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Profile photo</h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                Upload a clear photo from your device. This will appear in the header, sidebar, and profile page.
              </p>
              {selectedFileName ? <p className="mt-1 truncate text-xs text-emerald-700 dark:text-emerald-300">{selectedFileName}</p> : null}
              {errors.profilePictureUrl ? (
                <p className="mt-1 text-sm text-destructive">{errors.profilePictureUrl.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void handleFileChange(event)} />
            <Button type="button" variant="outline" onClick={chooseFile} disabled={isSubmitting || isPreparingPhoto}>
              <Upload aria-hidden={true} size={16} />
              {isPreparingPhoto ? "Preparing..." : profilePictureUrl ? "Change photo" : "Upload photo"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" autoComplete="name" {...register("fullName")} />
        {errors.fullName ? <p className="text-sm text-destructive">{errors.fullName.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input id="age" type="number" min={5} max={120} {...register("age")} />
        {errors.age ? <p className="text-sm text-destructive">{errors.age.message}</p> : null}
      </div>

      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <Button type="submit" disabled={!canSubmit}>
        <Save aria-hidden="true" size={16} />
        {isSubmitting ? "Saving..." : "Save profile and continue"}
      </Button>
      {!canSubmit ? (
        <p className="text-xs text-muted-foreground">
          Add your photo, full name, and age first. The workspace opens after your profile is saved.
        </p>
      ) : null}
    </form>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
