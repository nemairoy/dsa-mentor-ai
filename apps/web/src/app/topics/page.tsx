import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { contentService } from "@/core/content/content-container";

const description = "Explore a structured collection of data structures and algorithms topics, from fundamentals to advanced interview patterns.";

export const metadata: Metadata = {
  title: "DSA Topics and Free Lessons",
  description,
  alternates: { canonical: "/topics" },
  openGraph: { title: "DSA Topics and Free Lessons", description, url: "/topics", type: "website" },
};

export default async function TopicsPage() {
  const roadmap = await contentService.getRoadmap();
  const lessonCount = roadmap.reduce((total, chapter) => total + chapter.lessons.length, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb"><Link href="/" className="hover:text-foreground">Home</Link><span className="px-2">/</span><span aria-current="page">Topics</span></nav>
      <section className="mt-6 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Free learning library</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Data structures and algorithms roadmap</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{description} Browse {roadmap.length} topics and {lessonCount} concise lessons at your own pace.</p>
      </section>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roadmap.map((chapter) => (
          <article key={chapter.slug} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary"><BookOpen size={19} aria-hidden="true" /></div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{chapter.difficulty}</span>
            </div>
            <h2 className="mt-4 text-lg font-bold">{chapter.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{chapter.description}</p>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span>{chapter.lessons.length} lessons · {chapter.estimatedHours} hours</span>
              <Link href={`/topics/${chapter.slug}`} className="inline-flex items-center gap-1 font-bold text-primary hover:underline" aria-label={`Explore ${chapter.title}`}>
                Explore <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
