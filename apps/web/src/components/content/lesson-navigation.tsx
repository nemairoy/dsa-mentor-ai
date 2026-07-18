import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { LessonSummary } from "@/core/content/domain/content";

type LessonNavigationProps = {
  previousLesson: LessonSummary | null;
  nextLesson: LessonSummary | null;
};

export function LessonNavigation({ previousLesson, nextLesson }: LessonNavigationProps) {
  return (
    <nav className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6" aria-label="Lesson">
      {previousLesson ? (
        <Link href={previousLesson.href} className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary">
          <ArrowLeft aria-hidden="true" size={16} />
          {previousLesson.title}
        </Link>
      ) : (
        <span />
      )}
      {nextLesson ? (
        <Link href={nextLesson.href} className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary">
          {nextLesson.title}
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      ) : null}
    </nav>
  );
}

