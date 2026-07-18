import { BookOpen, CheckCircle2 } from "lucide-react";

import type { Lesson } from "@/core/content/domain/content";

export function LessonTheoryPreview({ lesson }: { lesson: Lesson }) {
  const points = lesson.lesson.learningObjectives.length
    ? lesson.lesson.learningObjectives.slice(0, 3)
    : [lesson.lesson.summary, "Watch how each step changes the state.", "Practice once before moving to the next topic."];

  return (
    <section id="theory" className="scroll-mt-28 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          <BookOpen aria-hidden={true} size={16} />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Short theory</p>
          <h2 className="mt-1 text-base font-semibold">{lesson.lesson.title}</h2>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{lesson.lesson.summary}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2.5 md:grid-cols-3">
        {points.map((point) => (
          <div key={point} className="rounded-xl border border-border bg-background p-3">
            <CheckCircle2 aria-hidden={true} size={17} className="text-emerald-700 dark:text-emerald-300" />
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{point}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
