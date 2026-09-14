import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Bot, Code2, Sparkles } from "lucide-react";

import { BrandLockup } from "@/components/brand/brand-logo";
import { contentService } from "@/core/content/content-container";

const description =
  "Learn data structures and algorithms through a structured roadmap, clear lessons, coding practice, visual explanations, and focused AI guidance.";

export const metadata: Metadata = {
  title: { absolute: "DSA Mentor AI — Learn Data Structures and Algorithms" },
  description,
  alternates: { canonical: "/" },
  keywords: [
    "data structures and algorithms",
    "DSA lessons",
    "coding interview preparation",
    "algorithm practice",
    "AI coding tutor",
  ],
  openGraph: {
    title: "DSA Mentor AI — Learn Data Structures and Algorithms",
    description,
    url: "/",
    siteName: "DSA Mentor AI",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DSA Mentor AI — Learn Data Structures and Algorithms",
    description,
  },
};

export default async function HomePage() {
  const roadmap = await contentService.getRoadmap();
  const lessonCount = roadmap.reduce((total, chapter) => total + chapter.lessons.length, 0);
  const featuredChapters = roadmap.slice(0, 6);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DSA Mentor AI",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    description,
    creator: { "@type": "Person", name: "Nemai Roy" },
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <div className="border-b border-border bg-card/85 backdrop-blur">
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLockup />
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <Link href="/topics" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground sm:block">
              Free lessons
            </Link>
            <Link href="/sign-in" className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-sm transition hover:opacity-90">
              Open workspace
            </Link>
          </nav>
        </header>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(59,130,246,0.12),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
              <Sparkles size={14} aria-hidden="true" className="text-primary" />
              Structured DSA learning, from fundamentals to advanced topics
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Understand DSA. Practice with purpose. Build interview confidence.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Follow a complete learning roadmap with concise theory, runnable code examples, visual explanations, practice tools, and context-aware AI support.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <Link href="/topics" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5">
                Explore free lessons <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/sign-in" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold shadow-sm transition hover:bg-muted">
                Sign in with Google
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{roadmap.length} topics · {lessonCount} lessons · Built and owned by Nemai Roy</p>
          </div>

          <div className="grid gap-3 self-center sm:grid-cols-2">
            {[
              { icon: BookOpen, title: "Structured roadmap", text: "Move through connected topics in a deliberate learning order." },
              { icon: Code2, title: "Coding practice", text: "Turn concepts into working solutions with focused exercises." },
              { icon: Bot, title: "AI guidance", text: "Ask for explanations and help inside your private workspace." },
              { icon: Sparkles, title: "Visual learning", text: "Build intuition with diagrams, traces, and step-by-step examples." },
            ].map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary"><feature.icon size={20} aria-hidden="true" /></div>
                <h2 className="mt-4 font-bold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="featured-topics">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Learning roadmap</p>
            <h2 id="featured-topics" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Start with a core DSA topic</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Read public lessons freely, then open the workspace when you want progress tracking, notes, practice, and AI help.</p>
          </div>
          <Link href="/topics" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">View all topics <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredChapters.map((chapter) => (
            <Link key={chapter.slug} href={`/topics/${chapter.slug}`} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{chapter.difficulty} · {chapter.lessons.length} lessons</p>
              <h3 className="mt-2 text-lg font-bold group-hover:text-primary">{chapter.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{chapter.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Nemai Roy. DSA Mentor AI.</p>
          <div className="flex gap-4"><Link href="/topics" className="hover:text-foreground">Lessons</Link><Link href="/sign-in" className="hover:text-foreground">Sign in</Link></div>
        </div>
      </footer>
    </main>
  );
}
