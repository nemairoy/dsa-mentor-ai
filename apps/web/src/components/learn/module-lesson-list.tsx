"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ProgressBar } from "@/components/shared/premium-card";
import type { ChapterSummary } from "@/core/content/domain/content";

export function ModuleLessonList({ chapter }: { chapter: ChapterSummary }) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const difficulties = ["All", ...Array.from(new Set(chapter.lessons.map((lesson) => lesson.difficulty)))];
  const lessons = useMemo(
    () =>
      chapter.lessons.filter((lesson) => {
        const matchesQuery = `${lesson.title} ${lesson.summary} ${lesson.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
        const matchesDifficulty = difficulty === "All" || lesson.difficulty === difficulty;
        return matchesQuery && matchesDifficulty;
      }),
    [chapter.lessons, difficulty, query],
  );
  const completion = chapter.lessons.length ? Math.round((1 / chapter.lessons.length) * 100) : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
      <div className="space-y-3">
        <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1">
              <Search aria-hidden={true} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search lessons, tags, or concepts"
                className="h-9 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto">
              {difficulties.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDifficulty(item)}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition ${
                    difficulty === item
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {lessons.map((lesson, index) => (
          <Link
            key={lesson.slug}
            href={lesson.href}
            className="group rounded-xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {index === 0 ? (
                  <CheckCircle2 aria-hidden={true} className="text-emerald-700 dark:text-emerald-300" size={18} />
                ) : (
                  <Circle aria-hidden={true} className="text-muted-foreground" size={18} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Lesson {index + 1}</p>
                <h2 className="mt-0.5 text-sm font-semibold">{lesson.title}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{lesson.summary}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock aria-hidden={true} size={14} />
                    {lesson.durationMinutes} min / {lesson.difficulty}
                  </span>
                  {lesson.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2 py-0.5">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-3 shadow-sm xl:sticky xl:top-5">
        <p className="text-xs font-medium text-muted-foreground">Module progress</p>
        <p className="mt-1.5 text-lg font-semibold">{completion}%</p>
        <ProgressBar value={completion} className="mt-3" />
        <dl className="mt-4 space-y-2.5 text-xs">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Lessons</dt>
            <dd className="font-medium">{chapter.lessons.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Estimated time</dt>
            <dd className="font-medium">{chapter.estimatedHours}h</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Difficulty</dt>
            <dd className="font-medium">{chapter.difficulty}</dd>
          </div>
        </dl>
        <div className="mt-4 rounded-lg bg-muted p-2.5 text-xs leading-5 text-muted-foreground">
          Start with the first incomplete lesson, review the concept picture, then solve one practice item before moving on.
        </div>
      </aside>
    </div>
  );
}
