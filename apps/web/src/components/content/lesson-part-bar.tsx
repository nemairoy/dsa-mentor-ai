"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import type { LessonSummary } from "@/core/content/domain/content";
import { visibleTopicParts } from "@/components/content/lesson-learning-model";
import { announceRouteTransition } from "@/components/loading/route-transition";

type LessonPartBarProps = {
  lessons: LessonSummary[];
  currentLessonSlug: string;
};

export function LessonPartBar({ lessons, currentLessonSlug }: LessonPartBarProps) {
  const router = useRouter();
  const visibleLessons = useMemo(() => visibleTopicParts(lessons), [lessons]);

  function openLesson(lesson: LessonSummary) {
    if (lesson.slug === currentLessonSlug) {
      return;
    }

    announceRouteTransition();
    router.push(lesson.href);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">Topic parts</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Choose any part and continue freely.</p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 xl:max-h-[calc(100vh-180px)] xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden xl:pr-1">
        {visibleLessons.map((lesson) => {
          const active = lesson.slug === currentLessonSlug;
          const title = lesson.title.replace(`${lesson.chapter}: `, "");

          return (
            <button
              key={lesson.slug}
              type="button"
              onClick={() => openLesson(lesson)}
              disabled={active}
              title={title}
              className={`min-h-10 shrink-0 rounded-lg border px-3 py-2 text-left text-xs font-semibold leading-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default xl:w-full ${
                active
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm dark:bg-emerald-400/10 dark:text-emerald-200"
                  : "border-border bg-background text-foreground hover:border-emerald-300 hover:bg-muted"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="line-clamp-2">{title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
