import { BookOpen, CheckCircle2 } from "lucide-react";

import { buildLearningModel, isBubbleSortLesson } from "@/components/content/lesson-learning-model";
import type { Lesson } from "@/core/content/domain/content";

export function LessonTheoryPreview({ lesson }: { lesson: Lesson }) {
  const model = buildLearningModel(lesson);
  const bubbleSort = isBubbleSortLesson(lesson);
  const points = bubbleSort
    ? [
        "Definition: compare two neighboring values and swap only when the left value is bigger than the right value.",
        "Analogy: like bubbles rising in water, larger numbers keep moving right until they settle at the end.",
        "Proof idea: after each pass, the largest remaining value is fixed on the right side.",
      ]
    : [
        `Definition: ${model.definition}`,
        `Mental model: ${model.mentalModel}`,
        `Why it matters: ${model.whyItMatters}`,
      ];

  return (
    <section id="theory" className="scroll-mt-28 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          <BookOpen aria-hidden={true} size={16} />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Short theory</p>
          <h2 className="mt-1 text-base font-semibold">{lesson.lesson.title}</h2>
          {bubbleSort ? (
            <div className="mt-1.5 max-w-4xl space-y-2 text-sm leading-6 text-muted-foreground">
              <p>
                Bubble Sort is one of the easiest sorting algorithms to understand because it makes only one small decision at a time: look at two neighboring values and decide whether they should swap places.
              </p>
              <p className="text-xs leading-5">
                Think of arranging students by height while only comparing two students standing next to each other. If the taller student is on the left, they swap. After enough neighbor swaps, the tallest student reaches the far right. Bubble Sort repeats that idea until the whole list is ordered.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-1.5 max-w-4xl text-sm leading-6 text-muted-foreground">{model.definition}</p>
              <p className="mt-2 max-w-4xl text-xs leading-5 text-muted-foreground">{model.whyItMatters}</p>
            </>
          )}
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
