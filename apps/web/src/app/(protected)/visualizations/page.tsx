import { redirect } from "next/navigation";

import { AnimationCardGrid } from "@/components/visualization/animation-card-grid";
import { PageHeader } from "@/components/layout/page-header";
import { animationRegistry } from "@/core/visualization/registry/animation-registry";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

export default async function VisualizationsPage() {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    redirect("/profile-setup");
  }

  return (
    <>
      <PageHeader
        title="Visualizations"
        description="Static DSA concept pictures for quickly understanding each topic before practice."
      />
      <AnimationCardGrid animations={animationRegistry.list()} />
    </>
  );
}
