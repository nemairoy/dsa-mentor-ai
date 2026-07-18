import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, CalendarDays, CheckCircle2, Flame, NotebookPen, Sparkles, Target } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PremiumCard, ProgressBar, StatTile } from "@/components/shared/premium-card";
import { contentService } from "@/core/content/content-container";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    redirect("/profile-setup");
  }

  const roadmap = await contentService.getRoadmap();
  const [analytics, recommendations, plan, monthlyActivity] = await Promise.all([
    intelligenceService.getAnalytics(session.user.id, roadmap),
    intelligenceService.getRecommendations(session.user.id, roadmap),
    intelligenceService.getLearningPlan(session.user.id, roadmap),
    intelligenceService.getDailyActivity(session.user.id, 28),
  ]);
  const weeklyActivity = monthlyActivity.slice(-7);
  const primaryRecommendation = recommendations[0];
  const completion = analytics.snapshot.totalLessons
    ? Math.round((analytics.snapshot.completedLessons / analytics.snapshot.totalLessons) * 100)
    : 0;
  const focusTopics = analytics.topicMastery.slice(0, 6);
  const readiness = Math.max(3, analytics.learningScore);
  const maxWeeklyActivity = Math.max(1, ...weeklyActivity.map((day) => day.total));
  const weeklyTotal = weeklyActivity.reduce((total, day) => total + day.total, 0);
  const activeDays = monthlyActivity.filter((day) => day.total > 0).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Welcome${profile.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}`}
        description="Your AI learning cockpit for today. Resume, revise, practice, and keep the path simple."
      />
      <section className="overflow-hidden rounded-xl border border-emerald-900/20 bg-gradient-to-br from-emerald-800 via-slate-900 to-slate-950 p-3 text-white shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px]">
              <Sparkles aria-hidden={true} size={13} />
              AI recommendation
            </div>
            <h2 className="text-lg font-semibold leading-tight">{primaryRecommendation?.title ?? "Start your DSA journey"}</h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-emerald-50">
              {primaryRecommendation?.reason ?? "Choose a beginner module and complete one focused lesson today."}
            </p>
            <Link
              href={primaryRecommendation?.href ?? "/learn"}
              className="mt-3 inline-flex min-h-7 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-950"
            >
              Continue learning
              <ArrowRight aria-hidden={true} size={14} />
            </Link>
          </div>
          <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
            <p className="text-xs text-emerald-50">Today&apos;s goal</p>
            <p className="mt-1.5 text-base font-semibold">{plan.targetCompletion}</p>
            <p className="mt-3 text-xs text-emerald-50">{plan.estimatedStudyTimeMinutes} min focus session</p>
            <ProgressBar value={completion} className="mt-3 bg-white/15" />
            <p className="mt-2 text-xs text-emerald-50">{completion}% course completion</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={BookOpen} label="Started lessons" value={`${analytics.snapshot.startedLessons}`} detail="Opened" />
        <StatTile icon={CheckCircle2} label="Completed lessons" value={`${analytics.snapshot.completedLessons}/${analytics.snapshot.totalLessons}`} detail={`${completion}%`} />
        <StatTile icon={Target} label="Practice solved" value={`${analytics.snapshot.solvedProblems}/${analytics.snapshot.attemptedProblems}`} detail="Problems" />
        <StatTile icon={Flame} label="Study streak" value={`${analytics.snapshot.currentStreak} days`} detail={`${activeDays}/28 active`} />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <PremiumCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Weekly activity</h2>
              <p className="mt-1 text-xs text-muted-foreground">Lessons, practice, notes, and visualizations from your account.</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{weeklyTotal} actions</span>
          </div>
          <div className="mt-4 flex h-36 items-end gap-2">
            {weeklyActivity.map((day) => {
              const height = day.total ? Math.max(12, Math.round((day.total / maxWeeklyActivity) * 100)) : 0;

              return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end rounded-xl bg-muted/60 p-1" style={{ height: "120px" }}>
                  <div
                    className="w-full rounded-lg bg-emerald-600/80 dark:bg-emerald-400/80"
                    style={{ height: `${height}%` }}
                    title={`${day.total} actions on ${day.date}`}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{day.label.slice(0, 1)}</span>
              </div>
              );
            })}
          </div>
        </PremiumCard>
        <PremiumCard>
          <div className="flex items-center gap-2">
            <CalendarDays aria-hidden={true} size={18} />
            <h2 className="font-semibold">Learning heatmap</h2>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {monthlyActivity.map((day) => (
              <div
                key={day.date}
                title={`${day.total} actions on ${day.date}`}
                className={
                  day.total >= 4
                    ? "aspect-square rounded-lg bg-emerald-700 dark:bg-emerald-300"
                    : day.total >= 2
                      ? "aspect-square rounded-lg bg-emerald-500 dark:bg-emerald-400"
                      : day.total === 1
                        ? "aspect-square rounded-lg bg-emerald-300 dark:bg-emerald-500"
                        : "aspect-square rounded-lg bg-muted"
                }
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{activeDays} active days in the last 28 days.</p>
        </PremiumCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-[0.8fr_1.2fr]">
        <PremiumCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Readiness</h2>
              <p className="mt-1 text-xs text-muted-foreground">Overall learning health</p>
            </div>
            <div
              className="grid h-24 w-24 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--primary) ${readiness * 3.6}deg, var(--muted) 0deg)`,
              }}
            >
              <div className="grid h-16 w-16 place-items-center rounded-full bg-card">
                <span className="text-lg font-semibold">{readiness}%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-muted p-2">
              <p className="text-muted-foreground">Confidence</p>
              <p className="mt-1 font-semibold">{analytics.confidenceScore}%</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="text-muted-foreground">Consistency</p>
              <p className="mt-1 font-semibold">{analytics.consistencyScore}%</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center gap-2">
            <Brain aria-hidden={true} size={18} />
            <h2 className="font-semibold">Topic snapshot</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {focusTopics.map((topic) => (
              <div key={topic.topic} className="rounded-xl border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium">{topic.topic}</span>
                  <span className="text-muted-foreground">{topic.completed}/{topic.total}</span>
                </div>
                <ProgressBar value={topic.mastery} />
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <PremiumCard>
          <h2 className="font-semibold">Weak topics</h2>
          <div className="mt-3 space-y-2.5">
            {analytics.weakTopics.slice(0, 5).map((topic) => (
              <ProgressLine key={topic.topic} label={topic.topic} value={topic.mastery} />
            ))}
          </div>
        </PremiumCard>
        <PremiumCard>
          <h2 className="font-semibold">Strong topics</h2>
          <div className="mt-3 space-y-2.5">
            {analytics.strongTopics.length ? (
              analytics.strongTopics.slice(0, 5).map((topic) => <ProgressLine key={topic.topic} label={topic.topic} value={topic.mastery} />)
            ) : (
              <p className="text-xs text-muted-foreground">Complete more lessons to unlock strengths.</p>
            )}
          </div>
        </PremiumCard>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: BookOpen, label: "Quick resume", href: primaryRecommendation?.href ?? "/learn", text: "Continue your recommended lesson." },
          { icon: Target, label: "Practice now", href: "/practice", text: "Solve one focused problem." },
          { icon: NotebookPen, label: "Review notes", href: "/notes", text: "Revise your saved lesson notes." },
          { icon: Sparkles, label: "Ask AI Tutor", href: "/ai-tutor", text: "Clarify a confusing idea." },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="rounded-xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <action.icon aria-hidden={true} size={17} className="text-emerald-700 dark:text-emerald-300" />
            <h2 className="mt-2 text-sm font-semibold">{action.label}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{action.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProgressLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <ProgressBar value={value} />
    </div>
  );
}
