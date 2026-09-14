import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { notFound } from "next/navigation";

import { contentService } from "@/core/content/content-container";

type ChapterPageProps = { params: Promise<{ chapterSlug: string }> };

export async function generateStaticParams() {
  const roadmap = await contentService.getRoadmap();
  return roadmap.map((chapter) => ({ chapterSlug: chapter.slug }));
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { chapterSlug } = await params;
  const roadmap = await contentService.getRoadmap();
  const chapter = roadmap.find((item) => item.slug === chapterSlug);
  if (!chapter) return { title: "Topic not found", robots: { index: false } };
  const url = `/topics/${chapter.slug}`;
  return {
    title: `${chapter.title} Lessons`,
    description: chapter.description,
    keywords: [...chapter.tags, `${chapter.title} DSA`, `${chapter.title} tutorial`],
    alternates: { canonical: url },
    openGraph: { title: `${chapter.title} Lessons`, description: chapter.description, url, type: "website" },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { chapterSlug } = await params;
  const roadmap = await contentService.getRoadmap();
  const chapter = roadmap.find((item) => item.slug === chapterSlug);
  if (!chapter) notFound();

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${chapter.title} lessons`,
    description: chapter.description,
    itemListElement: chapter.lessons.map((lesson, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: lesson.title,
      url: `${baseUrl}/topics/${chapter.slug}/${lesson.slug}`,
    })),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb"><Link href="/" className="hover:text-foreground">Home</Link><span className="px-2">/</span><Link href="/topics" className="hover:text-foreground">Topics</Link><span className="px-2">/</span><span aria-current="page">{chapter.title}</span></nav>
      <header className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{chapter.difficulty} · {chapter.estimatedHours} hours</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{chapter.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{chapter.description}</p>
        {chapter.tags.length ? <div className="mt-5 flex flex-wrap gap-2">{chapter.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{tag}</span>)}</div> : null}
      </header>

      <section className="mt-8" aria-labelledby="chapter-lessons">
        <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-primary">Course outline</p><h2 id="chapter-lessons" className="mt-1 text-2xl font-bold">{chapter.lessons.length} lessons</h2></div></div>
        <ol className="mt-5 space-y-3">
          {chapter.lessons.map((lesson, index) => (
            <li key={lesson.slug}>
              <Link href={`/topics/${chapter.slug}/${lesson.slug}`} className="group grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/60 hover:shadow-md sm:grid-cols-[44px_1fr_auto] sm:items-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-black text-primary">{String(index + 1).padStart(2, "0")}</span>
                <span><span className="block font-bold group-hover:text-primary">{lesson.title}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{lesson.summary}</span></span>
                <span className="flex items-center gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock size={13} aria-hidden="true" />{lesson.durationMinutes} min</span><ArrowRight size={16} aria-hidden="true" className="text-primary" /></span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
