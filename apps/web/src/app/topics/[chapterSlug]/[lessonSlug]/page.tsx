import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { MarkdownContent } from "@/components/content/markdown-content";
import { contentService } from "@/core/content/content-container";

type LessonPageProps = {
  params: Promise<{ chapterSlug: string; lessonSlug: string }>;
};

export async function generateStaticParams() {
  const roadmap = await contentService.getRoadmap();
  return roadmap.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({ chapterSlug: chapter.slug, lessonSlug: lesson.slug })),
  );
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { chapterSlug, lessonSlug } = await params;
  const lesson = await contentService.getLesson(chapterSlug, lessonSlug);
  if (!lesson) return { title: "Lesson not found", robots: { index: false } };

  const url = `/topics/${chapterSlug}/${lessonSlug}`;
  const title = `${lesson.lesson.title} — ${lesson.chapter.title}`;
  return {
    title,
    description: lesson.lesson.summary,
    keywords: [...lesson.lesson.tags, `${lesson.lesson.title} tutorial`, `${lesson.chapter.title} DSA`],
    alternates: { canonical: url },
    openGraph: { title, description: lesson.lesson.summary, url, type: "article" },
    twitter: { card: "summary", title, description: lesson.lesson.summary },
  };
}

export default async function PublicLessonPage({ params }: LessonPageProps) {
  const { chapterSlug, lessonSlug } = await params;
  const lesson = await contentService.getLesson(chapterSlug, lessonSlug);
  if (!lesson) notFound();

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const url = `${baseUrl}/topics/${chapterSlug}/${lessonSlug}`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: lesson.lesson.title,
      description: lesson.lesson.summary,
      url,
      author: { "@type": "Person", name: "Nemai Roy" },
      provider: { "@type": "Organization", name: "DSA Mentor AI", url: baseUrl },
      isPartOf: { "@type": "Course", name: lesson.chapter.title, url: `${baseUrl}/topics/${chapterSlug}` },
      educationalLevel: lesson.lesson.difficulty,
      timeRequired: `PT${lesson.lesson.durationMinutes}M`,
      teaches: lesson.lesson.learningObjectives,
      keywords: lesson.lesson.tags.join(", "),
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "Topics", item: `${baseUrl}/topics` },
        { "@type": "ListItem", position: 3, name: lesson.chapter.title, item: `${baseUrl}/topics/${chapterSlug}` },
        { "@type": "ListItem", position: 4, name: lesson.lesson.title, item: url },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link><span>/</span>
        <Link href="/topics" className="hover:text-foreground">Topics</Link><span>/</span>
        <Link href={`/topics/${chapterSlug}`} className="hover:text-foreground">{lesson.chapter.title}</Link><span>/</span>
        <span aria-current="page">{lesson.lesson.title}</span>
      </nav>

      <header className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full bg-accent px-3 py-1 text-primary">{lesson.lesson.difficulty}</span>
          <span className="inline-flex items-center gap-1"><Clock size={13} aria-hidden="true" />{lesson.lesson.durationMinutes} min read</span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{lesson.lesson.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{lesson.lesson.summary}</p>
        {lesson.lesson.tags.length ? <div className="mt-5 flex flex-wrap gap-2">{lesson.lesson.tags.map((tag) => <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{tag}</span>)}</div> : null}
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
        <article className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <MarkdownContent markdown={removeLeadingTitle(lesson.markdown)} />
        </article>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Learning objectives</h2>
            <ul className="mt-3 space-y-3">
              {lesson.lesson.learningObjectives.map((objective) => <li key={objective} className="flex gap-2 text-sm leading-5 text-muted-foreground"><CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />{objective}</li>)}
            </ul>
          </section>
          <section className="rounded-2xl border border-primary/30 bg-accent p-5">
            <div className="flex items-center gap-2 font-bold"><Sparkles size={17} aria-hidden="true" className="text-primary" />Practice with AI</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Sign in to save progress, take notes, visualize concepts, and ask the AI tutor about this lesson.</p>
            <Link href="/sign-in" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">Open workspace <ArrowRight size={15} aria-hidden="true" /></Link>
          </section>
        </aside>
      </div>

      <nav className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="Lesson navigation">
        {lesson.previousLesson ? <Link href={toPublicLesson(lesson.previousLesson.href)} className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/60"><span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"><ArrowLeft size={14} aria-hidden="true" />Previous lesson</span><span className="mt-1 block font-bold">{lesson.previousLesson.title}</span></Link> : <span />}
        {lesson.nextLesson ? <Link href={toPublicLesson(lesson.nextLesson.href)} className="rounded-2xl border border-border bg-card p-4 text-right shadow-sm hover:border-primary/60"><span className="flex items-center justify-end gap-1 text-xs font-semibold text-muted-foreground">Next lesson<ArrowRight size={14} aria-hidden="true" /></span><span className="mt-1 block font-bold">{lesson.nextLesson.title}</span></Link> : null}
      </nav>
    </main>
  );
}

function removeLeadingTitle(markdown: string) {
  return markdown.replace(/^#\s+[^\r\n]+\r?\n+/, "").trim();
}

function toPublicLesson(href: string) {
  return href.replace(/^\/learn\//, "/topics/");
}
