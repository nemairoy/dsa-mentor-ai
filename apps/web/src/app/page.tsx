import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Bot, Code2, LineChart, ShieldCheck, Sparkles, Target } from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LandingPrimaryActions, SignInCallout } from "@/components/auth/landing-auth-guide";
import { BrandLockup } from "@/components/brand/brand-logo";
import { contentService } from "@/core/content/content-container";
import { APP_VERSION } from "@/lib/app-meta";

const description = "Learn data structures and algorithms through visual lessons, structured topics, coding practice, and focused AI guidance.";

export const metadata: Metadata = {
  title: { absolute: "DSA Mentor AI — Learn Data Structures and Algorithms" },
  description,
  alternates: { canonical: "/" },
  keywords: ["data structures and algorithms", "DSA lessons", "coding interview preparation", "algorithm practice", "AI coding tutor"],
  openGraph: { title: "DSA Mentor AI — Learn Data Structures and Algorithms", description, url: "/", siteName: "DSA Mentor AI", type: "website" },
  twitter: { card: "summary", title: "DSA Mentor AI", description },
};

export default async function HomePage() {
  const roadmap = await contentService.getRoadmap().catch(() => []);
  const structuredData = { "@context": "https://schema.org", "@type": "WebSite", name: "DSA Mentor AI", url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000", description, creator: { "@type": "Person", name: "Nemai Roy" } };

  return (
    <main className="sign-in-shell dark relative min-h-screen overflow-x-hidden bg-background px-4 pb-5 pt-24 text-foreground [color-scheme:dark]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_84%_14%,rgba(37,99,235,0.14),transparent_28%),linear-gradient(135deg,#050914,#09111f_48%,#071523)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07111f]/95 px-4 py-3 backdrop-blur-xl">
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" aria-label="DSA Mentor AI home" className="min-w-0"><BrandLockup size="sm" /></Link>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <Link href="/admin-login" className="hidden shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 backdrop-blur hover:text-white sm:inline-flex">Admin login</Link>
            <GoogleSignInButton compactOnMobile className="h-9 min-w-0 shrink-0 rounded-lg bg-white px-2.5 text-[10px] font-black text-slate-950 hover:bg-slate-100 sm:px-3 sm:text-xs [&_svg]:h-4 [&_svg]:w-4" />
          </nav>
        </header>
      </div>

      <section className="relative z-10 mx-auto grid w-full min-w-0 max-w-full items-center gap-8 py-7 lg:min-h-[calc(100vh-82px)] lg:max-w-7xl lg:grid-cols-[0.86fr_1.14fr] lg:py-8">
        <div className="min-w-0">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 py-1.5 text-[11px] font-medium text-slate-300 shadow-sm backdrop-blur"><Sparkles aria-hidden={true} size={13} /><span className="truncate">AI-powered DSA learning studio</span></div>
          <h1 className="max-w-2xl break-words text-[2.05rem] font-black leading-[1.08] tracking-normal text-white sm:text-[2.55rem] lg:text-[2.95rem] xl:text-[3.15rem]">Learn DSA with visual lessons and AI guidance.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">Follow structured topics, understand concepts visually, and practice with focused AI support.</p>
          <LandingPrimaryActions />
          <Link href="#topics" className="sign-in-topic-link group mt-5 flex w-full items-center gap-3 rounded-2xl border border-teal-300/25 bg-teal-300/[0.08] p-3 text-left transition hover:-translate-y-0.5 hover:border-teal-300/50 hover:bg-teal-300/[0.13] min-[420px]:max-w-[25rem]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-300/15 text-teal-200"><BookOpen aria-hidden={true} size={17} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-teal-100 sm:text-sm">Browse the free curriculum</span><span className="mt-0.5 block text-[11px] leading-4 text-slate-400">Explore every topic without creating an account</span></span><ArrowRight aria-hidden={true} size={16} className="shrink-0 text-teal-200 transition-transform group-hover:translate-x-1" /></Link>
          <div className="mt-7 grid min-w-0 gap-3 sm:grid-cols-3">{[{ icon: BookOpen, label: "Structured roadmap", value: "Topic-based flow" }, { icon: Bot, label: "AI tutor", value: "Context-aware help" }, { icon: ShieldCheck, label: "Secure access", value: "Google OAuth" }].map((item) => <div key={item.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/8 p-3.5 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-1"><item.icon aria-hidden={true} size={19} className="text-teal-300" /><p className="mt-3 text-xs font-bold sm:text-sm">{item.label}</p><p className="mt-1 text-[11px] font-medium text-slate-400">{item.value}</p></div>)}</div>
        </div>

        <div className="relative min-w-0">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-400/20 via-blue-500/16 to-violet-500/18 blur-2xl" />
          <div className="relative grid items-stretch gap-4 xl:grid-cols-[0.74fr_1.26fr]">
            <section className="order-1 flex min-w-0 flex-col justify-between rounded-[1.5rem] border border-white/10 bg-[#111827] p-5 shadow-2xl shadow-black/30 sm:p-6"><div><div className="mb-4 inline-flex rounded-full bg-emerald-300/10 px-3 py-1 text-[11px] font-bold text-emerald-200">Sign in</div><h2 className="max-w-xs text-2xl font-black leading-tight tracking-[-0.02em]">Open your learning workspace</h2><p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">Continue with Google to access lessons, practice, notes, and AI tutor tools.</p><SignInCallout><div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3"><GoogleSignInButton /></div></SignInCallout></div><div className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-slate-400"><ShieldCheck aria-hidden={true} size={15} className="mt-0.5 shrink-0 text-teal-300" /><span>Authentication uses Google OAuth. Password login is not used for this workspace.</span></div></section>
            <div className="order-2 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0c1322]/88 p-3 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-4"><div className="landing-visual min-h-[300px] overflow-hidden rounded-3xl border border-white/10 p-4 text-white shadow-inner shadow-black/20 sm:p-5"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div><div className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-[11px] font-semibold text-cyan-100">learning flow</div></div><div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl"><div className="mb-5 max-w-md"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">Learning flow</p><h2 className="mt-1 text-base font-black leading-snug sm:text-lg">From concept to confident practice</h2></div><div className="relative grid gap-2 sm:grid-cols-5"><div className="absolute left-10 right-10 top-[1.55rem] hidden h-0.5 bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-300 sm:block" />{[{ icon: BookOpen, label: "Learn", tone: "bg-teal-400 text-slate-950" }, { icon: Code2, label: "Code", tone: "bg-cyan-400 text-slate-950" }, { icon: Target, label: "Visualize", tone: "bg-blue-400 text-slate-950" }, { icon: Bot, label: "Practice", tone: "bg-violet-400 text-slate-950" }, { icon: LineChart, label: "Improve", tone: "bg-emerald-400 text-slate-950" }].map((step, index) => <div key={step.label} className="landing-float relative flex min-h-20 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/48 px-3 py-3 sm:flex-col sm:gap-1" style={{ animationDelay: `${index * 0.16}s` }} title={step.label}><div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.tone}`}><step.icon aria-hidden={true} size={16} /></div><span className="text-[11px] font-semibold text-slate-200 sm:text-[10px]">{step.label}</span></div>)}</div></div></div></div>
          </div>
        </div>
      </section>

      <section id="topics" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 pb-16 pt-6 lg:pb-24" aria-labelledby="topics-heading"><div className="border-t border-white/10 pt-8"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-300">Free learning library</p><h2 id="topics-heading" className="mt-2 text-2xl font-black text-white sm:text-3xl">Explore DSA topics</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Open any topic to load its lessons. AI tutor and coding practice require Google sign in.</p><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{roadmap.map((chapter, index) => <Link key={chapter.slug} prefetch={false} href={`/topics/${chapter.slug}`} className="landing-topic-card group rounded-2xl border border-white/10 bg-white/[0.045] p-4"><div className="flex items-center justify-between"><span className="font-mono text-[11px] text-teal-300/80">{String(index + 1).padStart(2, "0")}</span><ArrowRight size={15} className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-teal-300" aria-hidden="true" /></div><h3 className="mt-4 text-sm font-bold text-white group-hover:text-teal-200">{chapter.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{chapter.description}</p><p className="mt-3 text-[11px] font-semibold text-slate-500">{chapter.lessons.length} lessons · {chapter.difficulty}</p></Link>)}</div></div></section>

      <footer className="relative z-10 border-t border-white/10 pt-7 text-sm text-slate-400"><div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Nemai Roy · DSA Mentor AI · {APP_VERSION}</p><nav className="flex gap-5" aria-label="Footer navigation"><Link href="#topics" className="hover:text-white">Topics</Link><Link href="/" className="hover:text-white">Back to home</Link></nav></div></footer>
    </main>
  );
}
