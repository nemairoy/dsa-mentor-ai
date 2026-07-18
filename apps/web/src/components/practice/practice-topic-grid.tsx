"use client";

import Link from "next/link";
import {
  ArrowRight,
  Binary,
  Blocks,
  BookOpen,
  Boxes,
  Braces,
  GitBranch,
  Hash,
  Network,
  Route,
  Search,
  Workflow,
} from "lucide-react";

import type { ChapterSummary } from "@/core/content/domain/content";

const topicIcons = [BookOpen, Boxes, Binary, Braces, Search, Workflow, Blocks, Hash, GitBranch, Network, Route];

export function PracticeTopicGrid({ chapters }: { chapters: ChapterSummary[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Practice Topics</p>
        <h2 className="mt-1 text-lg font-semibold tracking-normal">Choose a topic to solve problems</h2>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {chapters.map((chapter, index) => {
          const Icon = topicIcons[index % topicIcons.length];

          return (
            <Link
              key={chapter.slug}
              href={`/practice?chapterSlug=${chapter.slug}`}
              className="group flex min-h-28 items-start gap-3 rounded-xl border border-border bg-background p-3 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-card hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-400/10 dark:text-emerald-300">
                <Icon aria-hidden={true} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{chapter.title}</span>
                <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                  {chapter.lessons.length * 3} coding problems across {chapter.lessons.length} parts.
                </span>
              </span>
              <ArrowRight aria-hidden={true} size={18} className="mt-1 shrink-0 text-muted-foreground transition group-hover:text-emerald-700" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
