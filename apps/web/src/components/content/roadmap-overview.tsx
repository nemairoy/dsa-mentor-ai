import Link from "next/link";
import { BookOpen } from "lucide-react";

import type { ChapterSummary } from "@/core/content/domain/content";

type RoadmapOverviewProps = {
  chapters: ChapterSummary[];
};

export function RoadmapOverview({ chapters }: RoadmapOverviewProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {chapters.map((chapter) => (
        <Link
          key={chapter.slug}
          href={chapter.lessons[0]?.href ?? "/learn"}
          className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <BookOpen aria-hidden="true" size={20} />
            </div>
            <div>
              <h2 className="font-semibold">{chapter.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{chapter.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {chapter.lessons.length} lessons · {chapter.estimatedHours}h · {chapter.difficulty}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
