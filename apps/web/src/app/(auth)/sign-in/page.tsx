import { redirect } from "next/navigation";
import {
  BookOpen,
  Bot,
  Code2,
  LineChart,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { BrandLockup } from "@/components/brand/brand-logo";
import { getCurrentSession } from "@/lib/session";

export default async function SignInPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-5 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_84%_14%,rgba(37,99,235,0.14),transparent_28%),linear-gradient(135deg,#f8fafc,#eef7f4_45%,#eaf1ff)] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(96,165,250,0.16),transparent_28%),linear-gradient(135deg,#050914,#09111f_48%,#071523)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
        <BrandLockup />
      </div>

      <section className="relative z-10 mx-auto grid w-full min-w-0 max-w-full items-center gap-8 py-7 lg:min-h-[calc(100vh-82px)] lg:max-w-7xl lg:grid-cols-[0.86fr_1.14fr] lg:py-8">
        <div className="min-w-0">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm shadow-slate-200/70 backdrop-blur dark:bg-white/7 dark:shadow-none">
            <Sparkles aria-hidden={true} size={13} />
            <span className="truncate">AI-powered DSA learning workspace</span>
          </div>
          <h1 className="max-w-2xl break-words text-[2.05rem] font-black leading-[1.08] tracking-normal sm:text-[2.55rem] lg:text-[2.95rem] xl:text-[3.15rem]">
            Learn DSA with visual lessons and AI guidance.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Follow structured topics, understand concepts visually, and practice with focused AI support.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background shadow-lg shadow-slate-950/15 dark:shadow-black/30 sm:text-sm">
              <Play aria-hidden={true} size={14} />
              Start learning
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/75 px-4 py-2 text-xs font-semibold text-foreground shadow-sm shadow-slate-200/60 backdrop-blur dark:bg-white/7 dark:shadow-none sm:text-sm">
              <Zap aria-hidden={true} size={14} className="text-amber-500" />
              Practice with AI
            </div>
          </div>
          <div className="mt-7 grid min-w-0 gap-3 sm:grid-cols-3">
            {[
              { icon: BookOpen, label: "Structured roadmap", value: "Topic-based flow" },
              { icon: Bot, label: "AI tutor", value: "Context-aware help" },
              { icon: ShieldCheck, label: "Secure access", value: "Google OAuth" },
            ].map((item) => (
              <div
                key={item.label}
                className="min-w-0 rounded-2xl border border-border bg-card/78 p-3.5 shadow-sm shadow-slate-200/70 backdrop-blur transition-transform duration-300 hover:-translate-y-1 dark:bg-white/8 dark:shadow-none"
              >
                <item.icon aria-hidden={true} size={19} className="text-teal-600 dark:text-teal-300" />
                <p className="mt-3 text-xs font-bold sm:text-sm">{item.label}</p>
                <p className="mt-1 text-[11px] font-medium text-muted-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-400/16 via-blue-500/12 to-violet-500/14 blur-2xl dark:from-teal-400/20 dark:via-blue-500/16 dark:to-violet-500/18" />

          <div className="relative grid items-stretch gap-4 xl:grid-cols-[1.26fr_0.74fr]">
            <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card/76 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:bg-[#0c1322]/88 dark:shadow-black/35">
              <div className="landing-visual min-h-[300px] overflow-hidden rounded-3xl border border-border p-5 text-foreground shadow-inner shadow-slate-200/70 dark:border-white/10 dark:text-white dark:shadow-black/20">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-semibold text-cyan-700 shadow-sm dark:border-white/10 dark:bg-white/7 dark:text-cyan-100">
                    learning flow
                  </div>
                </div>

                <div>
                  <div className="rounded-3xl border border-border bg-card/58 p-5 shadow-xl shadow-slate-900/8 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/10">
                    <div className="mb-5 max-w-md">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200">Learning flow</p>
                      <h3 className="mt-1 text-base font-black leading-snug tracking-normal sm:text-lg">From concept to confident practice</h3>
                    </div>
                    <div className="relative grid gap-2 sm:grid-cols-5">
                      <div className="absolute left-10 right-10 top-[1.55rem] hidden h-0.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-violet-500 dark:from-teal-300 dark:via-cyan-300 dark:to-violet-300 sm:block" />
                      {[
                        { icon: BookOpen, label: "Learn", tone: "bg-teal-400 text-slate-950" },
                        { icon: Code2, label: "Visualize", tone: "bg-cyan-400 text-slate-950" },
                        { icon: Target, label: "Practice", tone: "bg-blue-400 text-slate-950" },
                        { icon: Bot, label: "Review", tone: "bg-violet-400 text-slate-950" },
                        { icon: LineChart, label: "Improve", tone: "bg-emerald-400 text-slate-950" },
                      ].map((step, index) => (
                        <div
                          key={step.label}
                          className="landing-float relative flex min-h-20 items-center justify-center rounded-2xl border border-border bg-background/70 px-2 py-3 shadow-lg shadow-slate-900/8 dark:border-white/10 dark:bg-slate-950/48 dark:shadow-black/15"
                          style={{ animationDelay: `${index * 0.16}s` }}
                          title={step.label}
                        >
                          <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl ${step.tone}`}>
                            <step.icon aria-hidden={true} size={16} />
                          </div>
                          <span className="sr-only">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="flex min-w-0 flex-col justify-between rounded-[1.5rem] border border-border bg-card p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-[#111827] dark:shadow-black/30">
              <div>
                <div className="mb-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">
                  Sign in
                </div>
                <h2 className="max-w-xs text-2xl font-black leading-tight tracking-normal">Open your learning workspace</h2>
                <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                  Continue with Google to access lessons, practice, notes, and AI tutor tools.
                </p>
                <div className="mt-6 rounded-2xl border border-border bg-muted/45 p-3 dark:border-white/10 dark:bg-white/5">
                  <GoogleSignInButton />
                </div>
              </div>
              <div className="mt-6 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
                <ShieldCheck aria-hidden={true} size={15} className="mt-0.5 shrink-0 text-teal-500" />
                <span>Authentication uses Google OAuth. Password login is not used for this workspace.</span>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
