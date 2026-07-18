import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookMarked, Search, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PremiumCard } from "@/components/shared/premium-card";
import { contentService } from "@/core/content/content-container";
import { learningService } from "@/core/learning/learning-container";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

export default async function BookmarksPage() {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    redirect("/profile-setup");
  }

  const [bookmarks, roadmap] = await Promise.all([
    learningService.listBookmarks(session.user.id),
    contentService.getRoadmap(),
  ]);
  const lessonByKey = new Map(
    roadmap.flatMap((chapter) =>
      chapter.lessons.map((lesson) => [`${chapter.slug}/${lesson.slug}`, { chapter, lesson }] as const),
    ),
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Bookmarks" description="Saved lessons grouped for quick resume, revision, and interview prep." />
      <PremiumCard>
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <Search aria-hidden={true} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="h-9 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Search saved lessons" />
          </label>
          <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted">
            <SlidersHorizontal aria-hidden={true} size={16} />
            Sort by recent
          </button>
        </div>
      </PremiumCard>

      {bookmarks.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {bookmarks.map((bookmark) => {
            const entry = lessonByKey.get(`${bookmark.chapterSlug}/${bookmark.lessonSlug}`);

            return (
              <Link
                key={bookmark.id}
                href={`/learn/${bookmark.chapterSlug}/${bookmark.lessonSlug}`}
                className="group rounded-xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <BookMarked aria-hidden={true} size={20} className="text-emerald-700 dark:text-emerald-300" />
                <p className="mt-3 text-sm text-muted-foreground">{entry?.chapter.title ?? bookmark.chapterSlug}</p>
                <h2 className="mt-1 font-semibold">{entry?.lesson.title ?? bookmark.lessonSlug}</h2>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Quick resume</span>
                  <ArrowRight aria-hidden={true} size={16} className="transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <PremiumCard className="text-center">
          <BookMarked aria-hidden={true} size={28} className="mx-auto text-emerald-700 dark:text-emerald-300" />
          <h2 className="mt-3 text-base font-semibold">No saved lessons yet</h2>
          <p className="mx-auto mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground">
            Bookmark important lessons from the study page and they will appear here as grouped revision cards.
          </p>
          <Link href="/learn" className="mt-5 inline-flex min-h-8 items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            Explore lessons
          </Link>
        </PremiumCard>
      )}
    </div>
  );
}
