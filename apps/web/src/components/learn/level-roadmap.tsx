"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { ProgressBar } from "@/components/shared/premium-card";
import type { ChapterSummary } from "@/core/content/domain/content";

const levelGroups = [
  {
    id: "beginner",
    title: "Beginner",
    description: "Start with foundations, complexity, arrays, strings, searching, sorting, stacks, queues, and linked lists.",
    chapters: [
      "introduction",
      "algorithm-analysis",
      "time-complexity",
      "space-complexity",
      "big-o",
      "big-omega",
      "big-theta",
      "arrays",
      "strings",
      "searching",
      "sorting",
      "stack",
      "queue",
      "linked-list",
    ],
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "Build confidence with trees, heaps, tries, graphs, hashing, greedy methods, and dynamic programming.",
    chapters: [
      "hashing",
      "tree",
      "binary-tree",
      "binary-search-tree",
      "avl-tree",
      "heap",
      "trie",
      "graph",
      "greedy",
      "dynamic-programming",
      "bit-manipulation",
      "disjoint-set-union",
      "mathematics",
      "number-theory",
    ],
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Prepare for hard interviews and contests with advanced DP, graph algorithms, and range query structures.",
    chapters: [
      "backtracking",
      "deque",
      "segment-tree",
      "fenwick-tree",
      "competitive-programming",
      "interview-preparation",
      "advanced-graph-algorithms",
      "advanced-dynamic-programming",
    ],
  },
];

export function LevelRoadmap({ chapters }: { chapters: ChapterSummary[] }) {
  const [selectedLevel, setSelectedLevel] = useState(levelGroups[0].id);
  const chapterBySlug = useMemo(() => new Map(chapters.map((chapter) => [chapter.slug, chapter])), [chapters]);
  const activeLevel = levelGroups.find((level) => level.id === selectedLevel) ?? levelGroups[0];
  const modules = useMemo(
    () => activeLevel.chapters.map((slug) => chapterBySlug.get(slug)).filter(Boolean) as ChapterSummary[],
    [activeLevel, chapterBySlug],
  );

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Sparkles aria-hidden={true} size={13} />
          Choose your learning level
        </div>
        <div className="grid gap-2.5 lg:grid-cols-3">
          {levelGroups.map((level, index) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setSelectedLevel(level.id)}
              className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                selectedLevel === level.id
                  ? "border-emerald-500 bg-emerald-50 shadow-sm dark:bg-emerald-400/10"
                  : "border-border bg-background hover:border-emerald-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Level {index + 1}</p>
                  <h2 className="mt-1 text-base font-semibold">{level.title}</h2>
                </div>
                {index > 0 ? <Lock aria-hidden={true} size={18} className="text-muted-foreground" /> : null}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{level.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{activeLevel.title} path</h2>
            <p className="mt-1.5 max-w-3xl text-xs leading-5 text-muted-foreground">
              Work through these modules in order. Future unlock logic can plug into this same roadmap without changing the UI.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{modules.length} modules</p>
        </div>
        <div className="mt-4 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((chapter, index) => {
            const completion = index === 0 ? 18 : 0;
            const guided = selectedLevel !== "beginner" && index > 4;
            const next = index === 0;
            return (
              <Link
                key={chapter.slug}
                href={`/learn/${chapter.slug}`}
                className="group rounded-xl border border-border bg-background p-3 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-card hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{chapter.title}</h3>
                      {next ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300"><CheckCircle2 aria-hidden={true} size={12} />Start here</span> : null}
                      {guided ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Guided</span> : null}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{chapter.description}</p>
                  </div>
                  <ArrowRight aria-hidden={true} size={18} className="mt-1 text-muted-foreground transition group-hover:text-emerald-700" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{chapter.lessons.length} lessons / {chapter.estimatedHours}h</span>
                  <span>{chapter.difficulty}</span>
                </div>
                <ProgressBar value={completion} className="mt-3" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
