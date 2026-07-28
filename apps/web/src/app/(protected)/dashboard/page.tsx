import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, CheckCircle2, Dumbbell, Flame, NotebookPen, Sparkles, Target } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PremiumCard, ProgressBar } from "@/components/shared/premium-card";
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
  const [analytics, recommendations, plan] = await Promise.all([
    intelligenceService.getAnalytics(session.user.id, roadmap),
    intelligenceService.getRecommendations(session.user.id, roadmap),
    intelligenceService.getLearningPlan(session.user.id, roadmap),
  ]);

  const firstName = profile.fullName?.split(" ")[0] || "there";
  const lessonRecommendation = recommendations.find((item) => item.type === "lesson") ?? recommendations[0];
  const practiceRecommendation = recommendations.find((item) => item.type === "practice");
  const completion = analytics.snapshot.totalLessons
    ? Math.round((analytics.snapshot.completedLessons / analytics.snapshot.totalLessons) * 100)
    : 0;
  const practiceRate = analytics.snapshot.attemptedProblems
    ? Math.round((analytics.snapshot.solvedProblems / analytics.snapshot.attemptedProblems) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Choose one clear action for now. Learn the concept first, then solve a matching practice problem."
      />

      <section className="rounded-xl border border-border bg-card p-3 shadow-sm shadow-slate-200/70 dark:shadow-none">
        <div className="grid gap-3 lg:grid-cols-2">
          <DashboardAction
            icon={BookOpenCheck}
            eyebrow="Recommended lesson"
            title="Learn First"
            description={lessonRecommendation?.title ?? "Start your next DSA lesson"}
            detail={lessonRecommendation?.reason ?? "Build the concept before moving to code."}
            href={lessonRecommendation?.href ?? "/learn"}
            accent="emerald"
          />
          <DashboardAction
            icon={Dumbbell}
            eyebrow="Focused practice"
            title="Practice It"
            description={practiceRecommendation?.title ?? "Open practice problems"}
            detail={practiceRecommendation?.reason ?? "Apply the idea with one focused coding task."}
            href={practiceRecommendation?.href ?? "/practice"}
            accent="cyan"
          />
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-[0.85fr_1.15fr]">
        <PremiumCard>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <Sparkles aria-hidden={true} size={13} />
                Today&apos;s focus
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-tight">{plan.targetCompletion}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep this session simple: one lesson, one related practice task, and a short review if needed.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {plan.estimatedStudyTimeMinutes} min
            </span>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Course completion</span>
              <span>{completion}%</span>
            </div>
            <ProgressBar value={completion} />
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Your real progress</h2>
              <p className="mt-1 text-xs text-muted-foreground">Only the important account data is shown here.</p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {analytics.overallReadiness}
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat icon={BookOpenCheck} label="Started" value={`${analytics.snapshot.startedLessons}`} />
            <MiniStat icon={CheckCircle2} label="Completed" value={`${analytics.snapshot.completedLessons}/${analytics.snapshot.totalLessons}`} />
            <MiniStat icon={Target} label="Practice" value={`${analytics.snapshot.solvedProblems}/${analytics.snapshot.attemptedProblems}`} detail={`${practiceRate}% solved`} />
            <MiniStat icon={Flame} label="Streak" value={`${analytics.snapshot.currentStreak} days`} />
          </div>
        </PremiumCard>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <InfoCard
          icon={NotebookPen}
          title="Notes"
          value={`${analytics.snapshot.notes}`}
          text="Saved explanations and reminders."
          href="/notes"
        />
        <InfoCard
          icon={Sparkles}
          title="AI chats"
          value={`${analytics.snapshot.aiConversations}`}
          text="Tutor conversations from your account."
          href="/ai-tutor"
        />
        <InfoCard
          icon={Target}
          title="Learning score"
          value={`${analytics.learningScore}%`}
          text="Calculated from lessons, practice, revision, and consistency."
          href="/progress"
        />
      </section>
    </div>
  );
}

function DashboardAction({
  icon: Icon,
  eyebrow,
  title,
  description,
  detail,
  href,
  accent,
}: {
  icon: typeof BookOpenCheck;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  href: string;
  accent: "emerald" | "cyan";
}) {
  const styles =
    accent === "emerald"
      ? "from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-300"
      : "from-cyan-500/20 via-sky-500/10 to-transparent text-cyan-300";

  return (
    <Link
      href={href}
      className="group relative min-h-44 overflow-hidden rounded-xl border border-border bg-slate-950 p-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${styles}`} />
      <div className="relative flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
            <Icon aria-hidden={true} size={24} className={styles.includes("cyan") ? "text-cyan-300" : "text-emerald-300"} />
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/75">{eyebrow}</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm font-semibold text-white">{description}</p>
          <p className="mt-1.5 max-w-xl text-xs leading-5 text-white/70">{detail}</p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-semibold">
          Open now
          <ArrowRight aria-hidden={true} size={16} className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BookOpenCheck;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <Icon aria-hidden={true} size={17} className="text-emerald-700 dark:text-emerald-300" />
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold leading-tight">{value}</p>
      {detail ? <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  value,
  text,
  href,
}: {
  icon: typeof BookOpenCheck;
  title: string;
  value: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Icon aria-hidden={true} size={17} />
        </div>
        <span className="text-lg font-semibold">{value}</span>
      </div>
      <h2 className="mt-3 text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
    </Link>
  );
}
