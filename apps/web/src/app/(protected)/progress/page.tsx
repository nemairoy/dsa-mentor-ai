import { redirect } from "next/navigation";

import { IntelligenceDashboard } from "@/components/intelligence/intelligence-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { contentService } from "@/core/content/content-container";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

export default async function ProgressPage() {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    redirect("/profile-setup");
  }

  const roadmap = await contentService.getRoadmap();
  const [analytics, recommendations, plan, achievements] = await Promise.all([
    intelligenceService.getAnalytics(session.user.id, roadmap),
    intelligenceService.getRecommendations(session.user.id, roadmap),
    intelligenceService.getLearningPlan(session.user.id, roadmap),
    intelligenceService.getAchievements(session.user.id, roadmap),
  ]);

  return (
    <>
      <PageHeader title="Progress" description="Track your learning score, topic mastery, streaks, and readiness." />
      <IntelligenceDashboard analytics={analytics} recommendations={recommendations} plan={plan} achievements={achievements} />
    </>
  );
}

