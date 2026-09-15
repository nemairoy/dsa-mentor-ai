import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Bot, Check, Code2, Layers3, Sparkles, Terminal } from "lucide-react";

import { BrandLockup } from "@/components/brand/brand-logo";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { contentService } from "@/core/content/content-container";

const description = "Learn data structures and algorithms through a structured roadmap, visual explanations, coding practice, and focused AI guidance.";

export const metadata: Metadata = {
  title: { absolute: "DSA Mentor AI — Learn Data Structures and Algorithms" },
  description,
  alternates: { canonical: "/" },
  keywords: ["data structures and algorithms", "DSA lessons", "coding interview preparation", "algorithm practice", "AI coding tutor"],
  openGraph: { title: "DSA Mentor AI — Learn Data Structures and Algorithms", description, url: "/", siteName: "DSA Mentor AI", type: "website" },
  twitter: { card: "summary", title: "DSA Mentor AI — Learn Data Structures and Algorithms", description },
};

export default async function HomePage() {
  const roadmap = await contentService.getRoadmap();
  const lessonCount = roadmap.reduce((total, chapter) => total + chapter.lessons.length, 0);
  const structuredData = { "@context": "https://schema.org", "@type": "WebSite", name: "DSA Mentor AI", url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000", description, creator: { "@type": "Person", name: "Nemai Roy" } };

  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[#07111f] text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="landing-grid pointer-events-none fixed inset-0 opacity-45" />
      <div className="relative">
        <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07111f]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="DSA Mentor AI home"><BrandLockup size="sm" compact subtitle="Learn / Build / Master" className="[&_*]:text-slate-100" /></Link>
          <nav className="flex items-center gap-1 sm:gap-3" aria-label="Main navigation">
            <Link href="#topics" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white sm:block">Explore topics</Link>
            <GoogleSignInButton className="h-10 rounded-xl border border-white/15 bg-white px-2.5 text-[11px] font-black text-slate-950 shadow-lg shadow-black/10 hover:bg-slate-100 sm:px-4 sm:text-sm" />
          </nav>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl items-start gap-8 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-24 lg:pt-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-200"><span className="landing-status-dot h-1.5 w-1.5 rounded-full bg-emerald-300" />A calmer way to master algorithms</div>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.04] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.55rem]">Think in patterns.<br /><span className="landing-gradient-text">Code with confidence.</span></h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">A focused learning studio for data structures and algorithms—where every concept becomes a visual model, a runnable idea, and a skill you can explain.</p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <Link href="#topics" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-emerald-950/30 transition hover:-translate-y-1 hover:bg-emerald-200">Start with a lesson <ArrowRight size={17} aria-hidden="true" /></Link>
              <GoogleSignInButton className="min-h-12 rounded-xl border border-white/15 bg-white/6 px-5 py-3 text-sm font-bold text-white hover:bg-white/12" />
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-400"><span className="inline-flex items-center gap-2"><Check size={14} className="text-emerald-300" aria-hidden="true" />No paywall for lessons</span><span className="inline-flex items-center gap-2"><Check size={14} className="text-emerald-300" aria-hidden="true" />Built by Nemai Roy</span></div>
          </div>

          <div className="relative mx-auto w-full max-w-[610px] lg:ml-auto">
            <div className="landing-orb landing-orb-one" /><div className="landing-orb landing-orb-two" />
            <div className="relative rounded-[2rem] border border-white/12 bg-[#0d1a2c]/90 p-3 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-4">
              <div className="flex items-center justify-between rounded-t-[1.35rem] border border-white/8 bg-[#101f33] px-4 py-3"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /></div><span className="font-mono text-[10px] text-slate-500">dsa-mentor / learning-loop</span><Terminal size={15} className="text-slate-500" aria-hidden="true" /></div>
              <div className="grid gap-4 p-4 sm:grid-cols-[1.12fr_0.88fr] sm:p-6">
                <div className="landing-code-panel rounded-2xl border border-white/8 bg-[#081321] p-4 font-mono text-[11px] leading-6 shadow-inner shadow-black/30 sm:text-xs"><p className="text-slate-500">{"// find the pattern, then make it yours"}</p><p><span className="text-violet-300">function</span> <span className="text-sky-300">binarySearch</span>(items, target) {"{"}</p><p className="pl-4"><span className="text-violet-300">let</span> left = <span className="text-amber-200">0</span>;</p><p className="pl-4"><span className="text-violet-300">let</span> right = items.length - <span className="text-amber-200">1</span>;</p><p className="pl-4"><span className="text-violet-300">while</span> (left &lt;= right) {"{"}</p><p className="pl-8"><span className="text-violet-300">const</span> mid = ...;</p><p className="pl-8 text-emerald-300">{"// invariant stays visible"}</p><p className="pl-4">{"}"}</p><p>{"}"}</p><div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-3 text-[10px] text-emerald-300"><span className="landing-cursor h-3 w-1 bg-emerald-300" />ready to reason</div></div>
                <div className="relative flex min-h-[230px] items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-emerald-300/10 via-sky-300/5 to-violet-300/10"><div className="landing-mascot" aria-hidden="true"><div className="landing-mascot-antenna" /><div className="landing-mascot-face"><span className="landing-eye landing-eye-left" /><span className="landing-eye landing-eye-right" /><span className="landing-smile" /></div><div className="landing-mascot-body"><span className="landing-mascot-badge"><Code2 size={16} /></span></div><span className="landing-arm landing-arm-left" /><span className="landing-arm landing-arm-right" /></div><span className="landing-chip landing-chip-top">visualize</span><span className="landing-chip landing-chip-bottom">ship insight</span><span className="absolute inset-x-8 bottom-7 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" /></div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-[1.35rem] border-t border-white/8 bg-[#0b1728] px-4 py-3 text-[11px] text-slate-400 sm:px-6"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-300" />Concept model loaded</span><span className="font-mono text-slate-500">01 / 06 · arrays</span></div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-white/[0.025]" aria-label="Platform highlights"><div className="mx-auto grid max-w-7xl gap-px px-4 sm:grid-cols-3 sm:px-6 lg:px-8">{[{ icon: Layers3, value: roadmap.length, label: "connected topics" }, { icon: BookOpen, value: lessonCount, label: "focused lessons" }, { icon: Bot, value: "24/7", label: "AI study support" }].map((item) => <div key={item.label} className="flex items-center gap-3 border-white/8 py-5 sm:border-r sm:px-6 sm:first:border-l"><item.icon size={18} className="text-emerald-300" aria-hidden="true" /><div><p className="text-lg font-black text-white">{item.value}</p><p className="text-xs font-semibold text-slate-500">{item.label}</p></div></div>)}</div></section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-labelledby="how-it-works"><div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">A better learning loop</p><h2 id="how-it-works" className="mt-3 max-w-md text-3xl font-black tracking-tight text-white sm:text-4xl">Less memorizing.<br />More understanding.</h2><p className="mt-4 max-w-md text-sm leading-6 text-slate-400">Move from intuition to implementation with a workflow designed for the way developers actually learn.</p></div><div className="grid gap-3 sm:grid-cols-3">{[{ number: "01", icon: BookOpen, title: "Learn the idea", text: "Short theory and a clear mental model." }, { number: "02", icon: Code2, title: "See it in motion", text: "Trace states, edges, and invariants." }, { number: "03", icon: Sparkles, title: "Practice deeply", text: "Use code, tests, and AI feedback." }].map((step) => <article key={step.number} className="landing-step-card rounded-2xl border border-white/10 bg-white/[0.045] p-5"><div className="flex items-center justify-between"><step.icon size={19} className="text-emerald-300" aria-hidden="true" /><span className="font-mono text-xs text-slate-600">{step.number}</span></div><h3 className="mt-7 font-bold text-white">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p></article>)}</div></div></section>

        <section id="topics" className="scroll-mt-24 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8" aria-labelledby="all-topics"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Free learning library</p><h2 id="all-topics" className="mt-3 text-2xl font-black text-white sm:text-3xl">Explore every DSA topic</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Choose a topic to open its lessons. Content loads only when you enter a topic, keeping this page fast.</p></div></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{roadmap.map((chapter, index) => <Link key={chapter.slug} prefetch={false} href={"/topics/" + chapter.slug} className="landing-topic-card group rounded-2xl border border-white/10 bg-white/[0.045] p-5"><div className="flex items-center justify-between"><span className="font-mono text-xs text-emerald-300/80">{String(index + 1).padStart(2, "0")}</span><ArrowRight size={16} className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300" aria-hidden="true" /></div><h3 className="mt-6 font-bold text-white group-hover:text-emerald-200">{chapter.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{chapter.description}</p><p className="mt-4 text-xs font-semibold text-slate-500">{chapter.lessons.length} lessons · {chapter.difficulty}</p></Link>)}</div></section>

        <footer className="border-t border-white/8"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p>© {new Date().getFullYear()} Nemai Roy · DSA Mentor AI</p><div className="flex gap-5"><Link href="#topics" className="hover:text-white">Lessons</Link><Link href="/sign-in" className="hover:text-white">Sign in</Link></div></div></footer>
      </div>
    </main>
  );
}
