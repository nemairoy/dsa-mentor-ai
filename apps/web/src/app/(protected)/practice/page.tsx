import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PracticeProblemList } from "@/components/practice/practice-problem-list";
import { PracticeTopicGrid } from "@/components/practice/practice-topic-grid";
import { PremiumCard } from "@/components/shared/premium-card";
import { contentService } from "@/core/content/content-container";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

type PracticePageProps = {
  searchParams: Promise<{
    chapterSlug?: string;
    lessonSlug?: string;
    difficulty?: string;
    status?: string;
  }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    redirect("/profile-setup");
  }

  const params = await searchParams;
  const roadmap = await contentService.getRoadmap();
  const selectedTopic = params.chapterSlug ? roadmap.find((chapter) => chapter.slug === params.chapterSlug) : null;

  if (!params.chapterSlug) {
    return (
      <div className="space-y-4">
        <PageHeader title="Practice" description="Choose a DSA topic first, then solve focused coding problems for that topic." />
        <PracticeTopicGrid chapters={roadmap} />
      </div>
    );
  }

  const problems = await intelligenceService.listPracticeProblems(session.user.id, params);
  const baseHref = `/practice?chapterSlug=${params.chapterSlug}`;
  const selectedDifficulty = params.difficulty ?? "All";
  const selectedStatus = params.status ?? "all";

  function filterHref(next: { difficulty?: string | null; status?: string | null }) {
    const searchParams = new URLSearchParams({ chapterSlug: params.chapterSlug ?? "" });
    const difficulty = next.difficulty === null ? undefined : next.difficulty ?? params.difficulty;
    const status = next.status === null ? undefined : next.status ?? params.status;

    if (difficulty) searchParams.set("difficulty", difficulty);
    if (status) searchParams.set("status", status);

    return `/practice?${searchParams.toString()}`;
  }

  function filterClass(active: boolean) {
    return active
      ? "rounded-full border border-emerald-600 bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-950 shadow-sm dark:border-emerald-400/60 dark:bg-emerald-400/10 dark:text-emerald-200"
      : "rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-emerald-300 hover:text-foreground";
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={selectedTopic ? `${selectedTopic.title} Practice` : "Practice"}
        description="Solve coding problems grouped by topic. Pick a problem, open it, and complete it with sample tests and AI help."
      />
      <PremiumCard>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal aria-hidden={true} size={18} />
            Filters
          </div>
          <Link href="/practice" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            Change topic
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={params.status ? filterHref({ difficulty: null }) : baseHref} className={filterClass(selectedDifficulty === "All")}>
            All
          </Link>
          {["Easy", "Medium", "Hard"].map((difficulty) => (
            <Link
              key={difficulty}
              href={filterHref({ difficulty })}
              className={filterClass(selectedDifficulty === difficulty)}
            >
              {difficulty}
            </Link>
          ))}
          {[
            { icon: CheckCircle2, label: "Solved", value: "solved" },
            { icon: Circle, label: "Unsolved", value: "unsolved" },
          ].map((filter) => (
            <Link
              key={filter.label}
              href={filterHref({ status: selectedStatus === filter.value ? null : filter.value })}
              className={`inline-flex items-center gap-2 ${filterClass(selectedStatus === filter.value)}`}
            >
              <filter.icon aria-hidden={true} size={15} />
              {filter.label}
            </Link>
          ))}
        </div>
      </PremiumCard>
      <PracticeProblemList problems={problems} />
    </div>
  );
}
