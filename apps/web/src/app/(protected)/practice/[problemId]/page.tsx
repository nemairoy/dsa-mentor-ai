import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Code2, Database, Lightbulb, TestTube2 } from "lucide-react";

import { PracticeWorkspacePanel } from "@/components/practice/practice-workspace-panel";
import { PremiumCard } from "@/components/shared/premium-card";
import { intelligenceService } from "@/core/intelligence/intelligence-container";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

type PracticeProblemPageProps = {
  params: Promise<{ problemId: string }>;
};

export default async function PracticeProblemPage({ params }: PracticeProblemPageProps) {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    redirect("/profile-setup");
  }

  const { problemId } = await params;
  const problem = await intelligenceService.getPracticeProblem(problemId);

  if (!problem) {
    notFound();
  }

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.03),transparent)] p-3 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.28),transparent)]">
          <Link href="/practice" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft aria-hidden={true} size={15} />
            Back to practice
          </Link>
          <div className="mt-2.5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                {problem.topic} / {problem.subtopic} / {problem.difficulty}
              </p>
              <h1 className="mt-1 max-w-4xl text-xl font-semibold tracking-normal text-foreground md:text-2xl">{problem.title}</h1>
              <p className="mt-1.5 max-w-4xl text-xs leading-5 text-muted-foreground md:text-sm">{problem.explanation}</p>
            </div>
            <div className="grid min-w-[260px] grid-cols-3 gap-2">
              <HeaderMetric icon={Code2} label="Function" value={problem.judgeMetadata.functionName ?? "solve"} />
              <HeaderMetric icon={Clock} label="Time" value={`${problem.judgeMetadata.timeLimitMs ?? 1000} ms`} />
              <HeaderMetric icon={TestTube2} label="Samples" value={`${problem.testCases.length}`} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)]">
        <main className="space-y-4">
          <PremiumCard>
            <section>
              <h2 className="text-base font-semibold">Problem description</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{problem.explanation}</p>
            </section>

            <section className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(160px,0.8fr)_minmax(160px,0.8fr)]">
              <div className="min-w-0 rounded-xl border border-border bg-background p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Database aria-hidden={true} size={15} />
                  Function
                </div>
                <code className="mt-2 block max-w-full overflow-x-auto whitespace-nowrap rounded-lg bg-muted px-2 py-1.5 text-xs font-semibold">
                  {problem.judgeMetadata.functionName ?? "solve"}
                </code>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Clock aria-hidden={true} size={15} />
                  Time limit
                </div>
                <p className="mt-2 text-sm font-semibold">{problem.judgeMetadata.timeLimitMs ?? 1000} ms</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CheckCircle2 aria-hidden={true} size={15} />
                  Memory
                </div>
                <p className="mt-2 text-sm font-semibold">{problem.judgeMetadata.memoryLimitMb ?? 256} MB</p>
              </div>
            </section>
          </PremiumCard>

          <PremiumCard>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <TestTube2 aria-hidden={true} size={18} />
              Sample test cases
            </div>
            <div className="grid gap-3">
              {problem.testCases.map((testCase, index) => (
                <section key={`${problem.id}-sample-${index}`} className="rounded-xl border border-border bg-background p-3">
                  <h3 className="text-sm font-semibold">Sample {index + 1}</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Input</p>
                      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs"><code>{testCase.input}</code></pre>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Expected output</p>
                      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs"><code>{testCase.output}</code></pre>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Explanation</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{testCase.explanation}</p>
                  </div>
                </section>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Lightbulb aria-hidden={true} size={18} />
              Hints and editorial
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              {problem.hints.map((hint) => <li key={hint}>{hint}</li>)}
            </ul>
            <div className="mt-4 rounded-xl border border-border bg-background p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Editorial</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{problem.editorial}</p>
            </div>
          </PremiumCard>
        </main>

        <PracticeWorkspacePanel problem={problem} />
      </div>
    </div>
  );
}

function HeaderMetric({ icon: Icon, label, value }: { icon: typeof Code2; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background/80 p-2.5 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
        <Icon aria-hidden={true} size={12} />
        {label}
      </div>
      <p className="mt-1 truncate text-[11px] font-semibold text-foreground">{value}</p>
    </div>
  );
}
