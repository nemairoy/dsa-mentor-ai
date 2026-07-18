"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, Building2, CheckCircle2, Circle, Lightbulb, TestTube2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { PracticeProblem } from "@/core/intelligence/domain/intelligence";

export function PracticeProblemList({ problems }: { problems: PracticeProblem[] }) {
  const initialCompleted = useMemo(() => new Set(problems.filter((problem) => problem.solved).map((problem) => problem.id)), [problems]);
  const [completed, setCompleted] = useState<Set<string>>(initialCompleted);

  async function markSolved(problemId: string) {
    const response = await fetch("/api/practice/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId,
        status: "solved",
        timeSpentSeconds: 900,
        mistakes: [],
      }),
    });

    if (response.ok) {
      setCompleted((current) => new Set([...current, problemId]));
    }
  }

  if (!problems.length) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No practice problems match the selected filters.
      </section>
    );
  }

  return (
    <div className="grid gap-3">
      {problems.map((problem) => {
        const solved = completed.has(problem.id);
        return (
          <section key={problem.id} className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{problem.topic}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
                    {problem.difficulty}
                  </span>
                  {solved ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
                      <CheckCircle2 aria-hidden={true} size={14} />
                      Solved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      <Circle aria-hidden={true} size={14} />
                      Unsolved
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-base font-semibold">{problem.title}</h2>
                <p className="mt-1.5 max-w-5xl text-sm leading-6 text-muted-foreground">{problem.explanation}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {problem.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{tag}</span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 aria-hidden={true} size={14} />
                    {problem.companyTags.slice(0, 2).join(", ") || "Interview pattern"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Lightbulb aria-hidden={true} size={14} />
                    {problem.hints.length} hints
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <TestTube2 aria-hidden={true} size={14} />
                    {problem.testCases.length} test cases
                  </span>
                </div>
              </div>
              <div className="flex gap-2 lg:flex-col">
                <Button asChild type="button" size="sm">
                  <Link href={`/practice/${problem.id}`}>
                    Open problem
                    <ArrowRight aria-hidden={true} size={16} />
                  </Link>
                </Button>
                <Button type="button" size="sm" disabled={solved} onClick={() => markSolved(problem.id)}>
                  {solved ? "Solved" : "Mark solved"}
                </Button>
                <Button type="button" size="sm" variant="outline">
                  <Bookmark aria-hidden={true} size={16} />
                  Save
                </Button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
