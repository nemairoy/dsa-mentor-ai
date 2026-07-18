"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { profileSchema, type ProfileFormValues, type ProfileInput } from "@/core/profile/domain/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileSetupFormProps = {
  defaultFullName?: string | null;
  defaultProfilePictureUrl?: string | null;
};

export function ProfileSetupForm({ defaultFullName, defaultProfilePictureUrl }: ProfileSetupFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues, unknown, ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: defaultFullName ?? "",
      age: undefined,
      profilePictureUrl: defaultProfilePictureUrl ?? "",
    },
  });

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

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5">
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

      <div className="space-y-2">
        <Label htmlFor="profilePictureUrl">Profile Picture URL</Label>
        <Input id="profilePictureUrl" type="url" autoComplete="photo" {...register("profilePictureUrl")} />
        {errors.profilePictureUrl ? (
          <p className="text-sm text-destructive">{errors.profilePictureUrl.message}</p>
        ) : null}
      </div>

      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        <Save aria-hidden="true" size={16} />
        {isSubmitting ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
