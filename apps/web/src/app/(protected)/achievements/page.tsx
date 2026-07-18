import { redirect } from "next/navigation";
import { Award, Lock, Sparkles, Trophy } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PremiumCard, ProgressBar } from "@/components/shared/premium-card";
import { contentService } from "@/core/content/content-container";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

export default async function AchievementsPage() {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    redirect("/profile-setup");
  }

  const roadmap = await contentService.getRoadmap();
  const achievements = await intelligenceService.getAchievements(session.user.id, roadmap);
  const earned = achievements.filter((achievement) => achievement.earned);
  const xp = earned.reduce((total, achievement) => total + achievement.xp, 0);

  return (
    <div className="space-y-4">
      <PageHeader title="Achievements" description="Milestones, XP, badges, and long-term learning motivation." />
      <section className="grid gap-3 md:grid-cols-3">
        <PremiumCard>
          <Trophy aria-hidden={true} size={20} className="text-emerald-700 dark:text-emerald-300" />
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">XP earned</p>
          <p className="mt-1 text-lg font-semibold">{xp}</p>
        </PremiumCard>
        <PremiumCard>
          <Award aria-hidden={true} size={20} className="text-emerald-700 dark:text-emerald-300" />
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Badges unlocked</p>
          <p className="mt-1 text-lg font-semibold">{earned.length}/{achievements.length}</p>
        </PremiumCard>
        <PremiumCard>
          <Sparkles aria-hidden={true} size={20} className="text-emerald-700 dark:text-emerald-300" />
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Next level</p>
          <p className="mt-1 text-lg font-semibold">{Math.max(0, 500 - xp)} XP</p>
        </PremiumCard>
      </section>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {achievements.map((achievement) => (
          <PremiumCard key={achievement.id} className={achievement.earned ? "border-emerald-300" : ""}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{achievement.badge}</p>
              {achievement.earned ? (
                <Award aria-hidden={true} size={18} className="text-emerald-700 dark:text-emerald-300" />
              ) : (
                <Lock aria-hidden={true} size={18} className="text-muted-foreground" />
              )}
            </div>
            <h2 className="mt-2 font-semibold">{achievement.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{achievement.description}</p>
            <ProgressBar value={achievement.earned ? 100 : 35} className="mt-4" />
            <p className="mt-3 text-sm font-medium">{achievement.earned ? "Earned" : "Locked"} / {achievement.xp} XP</p>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
}
