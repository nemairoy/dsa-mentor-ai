"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { LessonSummary } from "@/core/content/domain/content";

type LessonPartBarProps = {
  lessons: LessonSummary[];
  currentLessonSlug: string;
  currentTitle: string;
};

const correctAnswer = "I studied the explanation, visualization, and practice idea";

export function LessonPartBar({ lessons, currentLessonSlug, currentTitle }: LessonPartBarProps) {
  const router = useRouter();
  const [pendingLesson, setPendingLesson] = useState<LessonSummary | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const options = useMemo(
    () => [
      correctAnswer,
      "I only opened the page once",
      "I skipped the visual explanation and examples",
    ],
    [],
  );
  const passed = answered && selected === correctAnswer;

  function resetGate() {
    setPendingLesson(null);
    setConfirmed(false);
    setSelected(null);
    setAnswered(false);
  }

  function openLesson(lesson: LessonSummary) {
    if (lesson.slug === currentLessonSlug) {
      return;
    }

    setPendingLesson(lesson);
    setConfirmed(false);
    setSelected(null);
    setAnswered(false);
  }

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Topic parts</p>
            <p className="mt-1 text-xs text-muted-foreground">Choose the part you want to study.</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {lessons.map((lesson) => {
            const active = lesson.slug === currentLessonSlug;

            return (
              <button
                key={lesson.slug}
                type="button"
                onClick={() => openLesson(lesson)}
                className={`min-h-9 shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm dark:bg-emerald-400/10 dark:text-emerald-200"
                    : "border-border bg-background text-foreground hover:border-emerald-300 hover:bg-muted"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {lesson.title.replace(`${lesson.chapter}: `, "")}
              </button>
            );
          })}
        </div>
      </section>

      {pendingLesson ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
          <section className="w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Before moving on</p>
                <h2 className="mt-1.5 text-base font-semibold">Have you completed &quot;{currentTitle}&quot;?</h2>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  Confirm this part first, then answer one quick check to open &quot;{pendingLesson.title}&quot;.
                </p>
              </div>
              <button
                type="button"
                onClick={resetGate}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close"
              >
                <X aria-hidden={true} size={16} />
              </button>
            </div>

            {!confirmed ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={resetGate}>
                  Not yet
                </Button>
                <Button type="button" onClick={() => setConfirmed(true)}>
                  Yes, completed
                </Button>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-border bg-background p-3">
                <p className="text-sm font-medium">Quick check</p>
                <p className="mt-1 text-xs text-muted-foreground">What means this part is complete?</p>
                <div className="mt-3 grid gap-2">
                  {options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSelected(option);
                        setAnswered(true);
                      }}
                      className={`rounded-lg border px-3 py-2 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selected === option
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-200"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {answered ? (
                  <div className={`mt-3 flex items-center gap-2 rounded-lg p-2.5 text-xs ${passed ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-200"}`}>
                    {passed ? <CheckCircle2 aria-hidden={true} size={18} /> : <Lock aria-hidden={true} size={18} />}
                    {passed ? "Correct. You can open the selected part now." : "Review this part once more, then choose the complete learning step."}
                  </div>
                ) : null}

                <div className="mt-4 flex justify-end">
                  <Button type="button" disabled={!passed} onClick={() => router.push(pendingLesson.href)}>
                    Open selected part
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
