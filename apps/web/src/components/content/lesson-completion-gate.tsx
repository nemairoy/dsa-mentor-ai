"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { LessonSummary } from "@/core/content/domain/content";

type LessonCompletionGateProps = {
  previousLesson: LessonSummary | null;
  nextLesson: LessonSummary | null;
  currentTitle: string;
};

export function LessonCompletionGate({ previousLesson, nextLesson, currentTitle }: LessonCompletionGateProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const correctAnswer = "Understand the theory, visualization, code, and practice idea";
  const options = useMemo(
    () => [
      correctAnswer,
      "Only scroll to the bottom without studying",
      "Skip the visualization and quiz completely",
    ],
    [],
  );
  const passed = answered && selected === correctAnswer;

  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Before next topic</p>
          <h2 className="mt-1.5 text-base font-semibold">Have you completed &quot;{currentTitle}&quot;?</h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted-foreground">
            To keep the learning path clear, confirm completion and answer one quick check before the next topic unlocks.
          </p>
        </div>
        <Button type="button" className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300" onClick={() => setConfirmed(true)}>
          Yes, I completed it
        </Button>
      </div>

      {confirmed ? (
        <div className="mt-3 rounded-xl border border-border bg-background p-3">
          <p className="text-sm font-medium">Quick check</p>
          <p className="mt-1 text-xs text-muted-foreground">What should be complete before moving to the next DSA topic?</p>
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
                  selected === option ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-200" : "border-border hover:bg-muted"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {answered ? (
            <div className={`mt-3 flex items-center gap-2 rounded-lg p-2.5 text-xs ${passed ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200" : "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-200"}`}>
              {passed ? <CheckCircle2 aria-hidden={true} size={18} /> : <XCircle aria-hidden={true} size={18} />}
              {passed ? "Correct. The next topic is unlocked." : "Not quite. Review the lesson flow, then choose the complete learning step."}
            </div>
          ) : null}
        </div>
      ) : null}

      <nav className="mt-4 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Lesson">
        {previousLesson ? (
          <Link href={previousLesson.href} className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
            <ArrowLeft aria-hidden={true} size={16} />
            {previousLesson.title}
          </Link>
        ) : (
          <span />
        )}
        {nextLesson ? (
          passed ? (
            <Link href={nextLesson.href} className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              Next topic: {nextLesson.title}
              <ArrowRight aria-hidden={true} size={16} />
            </Link>
          ) : (
            <div className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Lock aria-hidden={true} size={16} />
              Next topic locked
            </div>
          )
        ) : null}
      </nav>
    </section>
  );
}
