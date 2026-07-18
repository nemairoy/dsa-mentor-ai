import { redirect } from "next/navigation";
import { CalendarDays, Mail, Sparkles, Trophy, User } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ProfilePictureEditor } from "@/components/profile/profile-picture-editor";
import { PremiumCard, StatTile } from "@/components/shared/premium-card";
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

  return (
    <div className="space-y-4">
      <PageHeader title="Profile" description="Your learning identity, study stats, and platform preferences." />
      <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">{profile.fullName}</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Mail aria-hidden={true} size={16} />{session.user.email}</span>
              <span className="inline-flex items-center gap-2"><User aria-hidden={true} size={16} />Age {profile.age}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays aria-hidden={true} size={16} />Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <ProfilePictureEditor
            fullName={profile.fullName}
            currentProfilePictureUrl={profile.profilePictureUrl}
          />
        </div>
      </section>
      <div className="grid gap-3 md:grid-cols-3">
        <StatTile icon={Sparkles} label="Learning score" value={`${analytics.learningScore}%`} />
        <StatTile icon={Trophy} label="Readiness" value={analytics.overallReadiness} />
        <StatTile icon={CalendarDays} label="Study streak" value={`${analytics.snapshot.currentStreak} days`} />
      </div>
      <PremiumCard>
        <h2 className="font-semibold">Preferences</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Google account", "System theme", "Beginner-friendly AI"].map((item) => (
            <div key={item} className="rounded-xl border border-border bg-background p-3 text-sm">{item}</div>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}
