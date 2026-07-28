"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { LessonSummary } from "@/core/content/domain/content";

type LessonCompletionGateProps = {
  previousLesson: LessonSummary | null;
  nextLesson: LessonSummary | null;
};

export function LessonCompletionGate({ previousLesson, nextLesson }: LessonCompletionGateProps) {
  if (!previousLesson && !nextLesson) {
    return null;
  }

  return (
    <nav className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" aria-label="Lesson">
      {previousLesson ? (
        <Link
          href={previousLesson.href}
          className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          <ArrowLeft aria-hidden={true} size={16} />
          {previousLesson.title}
        </Link>
      ) : (
        <span />
      )}
      {nextLesson ? (
        <Link
          href={nextLesson.href}
          className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          Next topic: {nextLesson.title}
          <ArrowRight aria-hidden={true} size={16} />
        </Link>
      ) : null}
    </nav>
  );
}
