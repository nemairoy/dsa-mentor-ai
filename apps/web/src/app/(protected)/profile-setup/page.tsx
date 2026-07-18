import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ProfileSetupForm } from "@/components/profile/profile-setup-form";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

export default async function ProfileSetupPage() {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <>
      <PageHeader
        title="Profile Setup"
        description="Complete the required profile details before entering the dashboard."
      />
      <ProfileSetupForm
        defaultFullName={session.user.name}
        defaultProfilePictureUrl={session.user.image}
      />
    </>
  );
}

