import Link from "next/link";

import type { ChapterSummary } from "@/core/content/domain/content";
import { cn } from "@/lib/utils";

type RoadmapSidebarProps = {
  chapters: ChapterSummary[];
  activeChapterSlug?: string;
  activeLessonSlug?: string;
};

export function RoadmapSidebar({ chapters, activeChapterSlug, activeLessonSlug }: RoadmapSidebarProps) {
  return (
    <aside className="rounded-lg border border-border bg-card p-3">
      <h2 className="text-sm font-semibold uppercase text-muted-foreground">Roadmap</h2>
      <nav className="mt-3 space-y-4" aria-label="DSA roadmap">
        {chapters.map((chapter) => (
          <section key={chapter.slug} className="space-y-2">
            <div>
              <Link
                href={chapter.lessons[0]?.href ?? "/learn"}
                className={cn(
                  "text-sm font-semibold hover:text-primary",
                  activeChapterSlug === chapter.slug && "text-primary",
                )}
              >
                {chapter.title}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">{chapter.lessons.length} lessons</p>
            </div>
            <ol className="space-y-1">
              {chapter.lessons.map((lesson) => (
                <li key={lesson.slug}>
                  <Link
                    href={lesson.href}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      activeChapterSlug === chapter.slug &&
                        activeLessonSlug === lesson.slug &&
                        "bg-accent font-medium text-accent-foreground",
                    )}
                  >
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </nav>
    </aside>
  );
}
