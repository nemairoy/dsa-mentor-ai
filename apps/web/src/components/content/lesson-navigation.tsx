import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { LessonSummary } from "@/core/content/domain/content";

type LessonNavigationProps = {
  previousLesson: LessonSummary | null;
  nextLesson: LessonSummary | null;
};

export function LessonNavigation({ previousLesson, nextLesson }: LessonNavigationProps) {
  return (
    <nav className="grid gap-3 sm:grid-cols-2" aria-label="Lesson navigation">
      {previousLesson ? (
        <Link href={previousLesson.href} className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm shadow-sm transition hover:border-emerald-400 hover:bg-muted">
          <ArrowLeft aria-hidden="true" size={16} />
          <span className="min-w-0"><span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Previous lesson</span><span className="mt-1 block truncate font-semibold">{previousLesson.title}</span></span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {nextLesson ? (
        <Link href={nextLesson.href} className="group flex min-w-0 items-center justify-end gap-3 rounded-xl border border-border bg-card p-3 text-right text-sm shadow-sm transition hover:border-emerald-400 hover:bg-muted">
          <span className="min-w-0"><span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Next lesson</span><span className="mt-1 block truncate font-semibold">{nextLesson.title}</span></span>
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      ) : null}
    </nav>
  );
}
