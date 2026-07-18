import Link from "next/link";

import { StatCard } from "@/components/intelligence/stat-card";
import { PremiumCard, ProgressBar } from "@/components/shared/premium-card";
import type { Achievement, LearningAnalytics, LearningPlan, Recommendation } from "@/core/intelligence/domain/intelligence";

type IntelligenceDashboardProps = {
  analytics: LearningAnalytics;
  recommendations: Recommendation[];
  plan: LearningPlan;
  achievements: Achievement[];
};

export function IntelligenceDashboard({ analytics, recommendations, plan, achievements }: IntelligenceDashboardProps) {
  const earnedXp = achievements.filter((item) => item.earned).reduce((total, item) => total + item.xp, 0);
  const level = Math.max(1, Math.floor(earnedXp / 500) + 1);
  const completion = Math.round((analytics.snapshot.completedLessons / Math.max(analytics.snapshot.totalLessons, 1)) * 100);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Learning Score" value={`${analytics.learningScore}%`} description={analytics.overallReadiness} />
        <StatCard label="Confidence" value={`${analytics.confidenceScore}%`} description="Lessons, practice, and revision" />
        <StatCard label="Study Streak" value={`${analytics.snapshot.currentStreak} days`} description="Consecutive study days" />
        <StatCard label="XP / Level" value={`${earnedXp} XP`} description={`Level ${level}`} />
      </div>

      <PremiumCard>
        <h2 className="font-semibold">Overall Progress</h2>
        <ProgressBar value={completion} className="mt-3 h-3" />
        <p className="mt-2 text-sm text-muted-foreground">
          {analytics.snapshot.completedLessons} of {analytics.snapshot.totalLessons} lessons completed
        </p>
      </PremiumCard>

      <div className="grid gap-3 lg:grid-cols-2">
        <PremiumCard>
          <h2 className="font-semibold">Daily Learning Plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">{plan.targetCompletion}</p>
          <p className="mt-2 text-sm">Estimated study time: {plan.estimatedStudyTimeMinutes} minutes</p>
          <div className="mt-4 space-y-2">
            {[...plan.lessons, ...plan.practice, ...plan.revision].map((item) => (
              <Link key={`${item.type}-${item.title}`} href={item.href} className="block rounded-2xl border border-border p-3 transition hover:border-emerald-300 hover:bg-muted">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
              </Link>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard>
          <h2 className="font-semibold">Adaptive Recommendations</h2>
          <div className="mt-4 space-y-2">
            {recommendations.map((item) => (
              <Link key={`${item.type}-${item.priority}`} href={item.href} className="block rounded-2xl border border-border p-3 transition hover:border-emerald-300 hover:bg-muted">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
              </Link>
            ))}
          </div>
        </PremiumCard>
      </div>

      <PremiumCard>
        <h2 className="font-semibold">Topic Mastery</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {analytics.topicMastery.slice(0, 12).map((topic) => (
            <div key={topic.topic}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{topic.topic}</span>
                <span className="text-muted-foreground">{topic.mastery}%</span>
              </div>
              <ProgressBar value={topic.mastery} />
            </div>
          ))}
        </div>
      </PremiumCard>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Solved Problems" value={analytics.snapshot.solvedProblems} />
        <StatCard label="AI Conversations" value={analytics.snapshot.aiConversations} />
        <StatCard label="Visualizations" value={analytics.snapshot.visualizations} />
        <StatCard label="Study Time" value={`${analytics.snapshot.studyTimeMinutes}m`} />
      </div>

      <PremiumCard>
        <h2 className="font-semibold">Achievements</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="rounded-2xl border border-border p-3">
              <p className="text-sm font-medium">{achievement.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{achievement.description}</p>
              <p className="mt-2 text-xs">{achievement.earned ? "Earned" : "Locked"} / {achievement.xp} XP</p>
            </div>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}
