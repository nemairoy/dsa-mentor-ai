import { redirect } from "next/navigation";
import type { ComponentType } from "react";
import { CalendarDays, CheckCircle2, Mail, ShieldCheck, Sparkles, Target, Trophy, User } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ProfilePictureEditor } from "@/components/profile/profile-picture-editor";
import { PremiumCard, ProgressBar, StatTile } from "@/components/shared/premium-card";
import { contentService } from "@/core/content/content-container";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

export default async function ProfilePage() {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    redirect("/profile-setup");
  }

  const roadmap = await contentService.getRoadmap();
  const analytics = await intelligenceService.getAnalytics(session.user.id, roadmap);
  const completion = analytics.snapshot.totalLessons
    ? Math.round((analytics.snapshot.completedLessons / analytics.snapshot.totalLessons) * 100)
    : 0;
  const firstName = profile.fullName.split(" ").filter(Boolean)[0] ?? profile.fullName;
  const joinedAt = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const focusTopics = analytics.topicMastery.slice(0, 4);

  return (
    <div className="space-y-4">
      <PageHeader title="Profile" description="Manage your learning identity, account details, and progress snapshot." />

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm shadow-slate-200/70 dark:shadow-none">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.03),transparent)] p-4 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.34),transparent)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
                <ShieldCheck aria-hidden={true} size={13} />
                Google verified profile
              </div>
              <h2 className="mt-3 text-2xl font-black leading-tight tracking-normal sm:text-3xl">{profile.fullName}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {firstName}&apos;s DSA Mentor AI workspace is tracking lessons, practice, notes, and AI-assisted learning progress.
              </p>
            </div>
            <div className="grid min-w-0 gap-2 text-xs text-muted-foreground sm:grid-cols-3 lg:min-w-[32rem]">
              <InfoPill icon={Mail} label="Email" value={session.user.email} />
              <InfoPill icon={User} label="Age" value={`${profile.age}`} />
              <InfoPill icon={CalendarDays} label="Joined" value={joinedAt} />
            </div>
          </div>
        </div>

        <div className="p-4">
          <ProfilePictureEditor
            fullName={profile.fullName}
            currentProfilePictureUrl={profile.profilePictureUrl}
          />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Sparkles} label="Learning score" value={`${analytics.learningScore}%`} detail="XP growth" />
        <StatTile icon={Trophy} label="Readiness" value={analytics.overallReadiness} detail={`${analytics.confidenceScore}% confidence`} />
        <StatTile icon={CalendarDays} label="Study streak" value={`${analytics.snapshot.currentStreak} days`} detail="Current" />
        <StatTile icon={CheckCircle2} label="Completed" value={`${analytics.snapshot.completedLessons}/${analytics.snapshot.totalLessons}`} detail={`${completion}%`} />
      </div>

      <div className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
        <PremiumCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Course progress</h2>
              <p className="mt-1 text-xs text-muted-foreground">Based on lessons completed in this account.</p>
            </div>
            <div
              className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
              style={{ background: `conic-gradient(var(--primary) ${completion * 3.6}deg, var(--muted) 0deg)` }}
            >
              <div className="grid h-16 w-16 place-items-center rounded-full bg-card">
                <span className="text-lg font-semibold">{completion}%</span>
              </div>
            </div>
          </div>
          <ProgressBar value={completion} className="mt-4" />
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <MiniMetric label="Started" value={`${analytics.snapshot.startedLessons}`} />
            <MiniMetric label="Solved" value={`${analytics.snapshot.solvedProblems}`} />
            <MiniMetric label="Attempted" value={`${analytics.snapshot.attemptedProblems}`} />
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center gap-2">
            <Target aria-hidden={true} size={18} className="text-emerald-700 dark:text-emerald-300" />
            <h2 className="font-semibold">Topic snapshot</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {focusTopics.length ? (
              focusTopics.map((topic) => (
                <div key={topic.topic} className="rounded-xl border border-border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium">{topic.topic}</span>
                    <span className="text-muted-foreground">{topic.mastery}%</span>
                  </div>
                  <ProgressBar value={topic.mastery} />
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground sm:col-span-2">
                Complete lessons to unlock topic insights.
              </div>
            )}
          </div>
        </PremiumCard>
      </div>

      <PremiumCard className="p-4">
        <h2 className="font-semibold">Workspace preferences</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { label: "Authentication", value: "Google OAuth" },
            { label: "Interface", value: "Theme aware" },
            { label: "AI support", value: "Beginner friendly" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-background p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card/70 p-3 shadow-sm backdrop-blur dark:bg-white/5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon aria-hidden={true} size={14} />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 truncate text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
