"use client";

import { Bot, Check, CheckCircle2, Clipboard, Code2, Lightbulb, Loader2, Play, RotateCcw, Send, Sparkles, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { languageLabels, type MarathonLanguage, type MarathonProblem } from "@/core/marathon/marathon";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";
type ExecutionResult = { sample: number; input: string; expected: string; actual: string; passed: boolean; error?: string };

const defaultRequest = "Give me an array or hashing problem that improves interview problem-solving skills.";

export function MarathonWorkspace() {
  const [request, setRequest] = useState(defaultRequest);
  const [language, setLanguage] = useState<MarathonLanguage>("python");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [problem, setProblem] = useState<MarathonProblem | null>(null);
  const [code, setCode] = useState("");
  const [generating, setGenerating] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [hintCount, setHintCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);

  const storageKey = useMemo(() => problem ? `marathon:${language}:${problem.functionName}:${problem.title}` : "", [language, problem]);

  useEffect(() => {
    if (!storageKey || !code) return;
    const timer = window.setTimeout(() => window.localStorage.setItem(storageKey, code), 500);
    return () => window.clearTimeout(timer);
  }, [code, storageKey]);

  async function generateProblem() {
    if (request.trim().length < 3) return;
    setGenerating(true);
    setError("");
    setResults([]);
    setProblem(null);
    setCode("");
    setShowSolution(false);
    setHintCount(0);
    try {
      const response = await fetch("/api/marathon/problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request, language, difficulty }),
        signal: AbortSignal.timeout(45_000),
      });
      const payload = await response.json() as { problem?: MarathonProblem; detail?: string };
      if (!response.ok || !payload.problem) throw new Error(payload.detail ?? "Problem generation failed.");
      setProblem(payload.problem);
      // A newly generated challenge must always start from its own template. Reusing a
      // same-title draft (for example, another "Two Sum") silently loads stale code.
      setCode(payload.problem.starterCode);
    } catch (cause) {
      setError(cause instanceof DOMException && cause.name === "TimeoutError"
        ? "Challenge generation took too long. Please try once more."
        : cause instanceof Error ? cause.message : "Problem generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function runCode() {
    if (!problem || !code.trim()) return;
    setRunning(true);
    setError("");
    setResults([]);
    try {
      const response = await fetch("/api/practice/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, functionName: problem.functionName, testCases: problem.testCases }),
      });
      const payload = await response.json() as { results?: ExecutionResult[]; detail?: string };
      if (!response.ok || !payload.results) throw new Error(payload.detail ?? "Execution failed.");
      setResults(payload.results);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The executor is unavailable right now.");
    } finally {
      setRunning(false);
    }
  }

  async function copySolution() {
    if (!problem) return;
    await navigator.clipboard.writeText(problem.solutionCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function selectLanguage(nextLanguage: MarathonLanguage) {
    if (nextLanguage === language) return;
    setLanguage(nextLanguage);
    setProblem(null);
    setCode("");
    setResults([]);
    setError("");
    setHintCount(0);
    setShowSolution(false);
  }

  const allPassed = results.length > 0 && results.every((result) => result.passed);

  return (
    <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <PanelHeader icon={Bot} title="AI Problem Setter" subtitle="Describe what you want to practice" tone="emerald" />
        <div className="space-y-4 p-3 sm:p-4">
          <div className="rounded-xl border border-border bg-background p-3">
            <textarea value={request} onChange={(event) => setRequest(event.target.value)} rows={3} maxLength={1200} placeholder="Example: Give me a medium sliding-window problem..." className="w-full resize-y bg-transparent text-sm leading-6 outline-none" />
            <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
                {(["python", "java", "cpp"] as MarathonLanguage[]).map((item) => <Choice key={item} active={language === item} onClick={() => selectLanguage(item)}>{languageLabels[item]}</Choice>)}
              </div>
              <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
                {(["easy", "medium", "hard"] as Difficulty[]).map((item) => <Choice key={item} active={difficulty === item} onClick={() => setDifficulty(item)}>{capitalize(item)}</Choice>)}
              </div>
            </div>
            <Button type="button" className="mt-3 w-full" disabled={generating || request.trim().length < 3} onClick={() => void generateProblem()}>
              {generating ? <Loader2 aria-hidden className="animate-spin" size={16} /> : <Sparkles aria-hidden size={16} />}
              {generating ? "Designing challenge..." : "Generate challenge"}
            </Button>
          </div>

          {!problem && !generating ? <EmptyProblem /> : null}
          {generating ? <ProblemSkeleton /> : null}
          {problem ? (
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300"><span>{problem.difficulty}</span><span>•</span><span>{problem.topic}</span></div>
                <h2 className="mt-1.5 text-xl font-semibold">{problem.title}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{problem.statement}</p>
              </div>
              <InfoBlock title="Input format" body={problem.inputFormat} />
              <InfoBlock title="Output format" body={problem.outputFormat} />
              <div><h3 className="text-sm font-semibold">Constraints</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{problem.constraints.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div>
                <h3 className="text-sm font-semibold">Test cases</h3>
                <div className="mt-2 grid gap-2">
                  {problem.testCases.map((test, index) => <div key={`${test.input}-${index}`} className="min-w-0 rounded-xl border border-border bg-background p-3 text-xs"><p className="font-semibold">Sample {index + 1}</p><CodeLine label="Input" value={test.input} /><CodeLine label="Output" value={test.output} />{test.explanation ? <p className="mt-2 leading-5 text-muted-foreground">{test.explanation}</p> : null}</div>)}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={() => setHintCount((count) => Math.min(count + 1, problem.hints.length))}><Lightbulb aria-hidden size={15} />{hintCount ? "Another hint" : "Show a hint"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowSolution((value) => !value)}><Code2 aria-hidden size={15} />{showSolution ? "Hide solution" : "Show solution"}</Button>
              </div>
              {hintCount ? <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3"><ol className="list-decimal space-y-2 pl-5 text-sm leading-6">{problem.hints.slice(0, hintCount).map((hint) => <li key={hint}>{hint}</li>)}</ol></div> : null}
              {showSolution ? <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3"><div><h3 className="font-semibold">Professional approach</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{problem.approach}</p><p className="mt-2 text-xs font-medium">Time: {problem.complexity.time} · Space: {problem.complexity.space}</p></div><div className="grid gap-2 sm:grid-cols-2"><Button type="button" onClick={() => { setCode(problem.solutionCode); setResults([]); }}><Code2 aria-hidden size={15} />Load in compiler</Button><Button type="button" variant="outline" onClick={() => void copySolution()}>{copied ? <Check aria-hidden size={15} /> : <Clipboard aria-hidden size={15} />}{copied ? "Copied" : "Copy full solution"}</Button></div></div> : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm 2xl:sticky 2xl:top-24 2xl:self-start">
        <PanelHeader icon={Code2} title={`${languageLabels[language]} Compiler`} subtitle={problem ? `Function: ${problem.functionName}` : "Generate a problem to begin"} tone="sky" />
        <div className="space-y-3 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground"><span>Autosaves on this device</span><button type="button" disabled={!problem} onClick={() => { if (problem) { setCode(problem.starterCode); setResults([]); } }} className="inline-flex items-center gap-1.5 font-medium hover:text-foreground disabled:opacity-40"><RotateCcw aria-hidden size={13} />Reset starter</button></div>
          <textarea value={code} onChange={(event) => setCode(event.target.value)} disabled={!problem} spellCheck={false} aria-label="Code editor" placeholder="Your generated starter code will appear here..." className="min-h-[430px] w-full resize-y rounded-xl border border-slate-700 bg-[#0b1220] p-4 font-mono text-[13px] leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed sm:min-h-[520px]" />
          <Button type="button" className="w-full" disabled={!problem || running || !code.trim()} onClick={() => void runCode()}>{running ? <Loader2 aria-hidden className="animate-spin" size={16} /> : <Play aria-hidden size={16} />}{running ? "Running samples..." : "Run all test cases"}</Button>
          {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          {results.length ? <div className="space-y-2"><div className={cn("rounded-xl border p-3 text-sm font-semibold", allPassed ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-200")}>{allPassed ? "Excellent — all test cases passed." : "Some test cases failed. Review the results below."}</div>{results.map((result) => <div key={result.sample} className="rounded-xl border border-border bg-background p-3 text-xs"><div className="flex items-center justify-between"><strong>Test {result.sample}</strong><span className={cn("inline-flex items-center gap-1 font-semibold", result.passed ? "text-emerald-600" : "text-destructive")}>{result.passed ? <CheckCircle2 aria-hidden size={14} /> : <XCircle aria-hidden size={14} />}{result.passed ? "Passed" : "Failed"}</span></div><CodeLine label="Expected" value={result.expected} /><CodeLine label="Actual" value={result.actual || result.error || "No output"} /></div>)}</div> : null}
        </div>
      </section>
    </div>
  );
}

function PanelHeader({ icon: Icon, title, subtitle, tone }: { icon: typeof Bot; title: string; subtitle: string; tone: "emerald" | "sky" }) { return <div className="flex items-center gap-3 border-b border-border p-3 sm:p-4"><span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white", tone === "emerald" ? "bg-emerald-600" : "bg-sky-600")}><Icon aria-hidden size={18} /></span><div className="min-w-0"><h2 className="font-semibold">{title}</h2><p className="truncate text-xs text-muted-foreground">{subtitle}</p></div></div>; }
function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition", active ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200" : "border-border hover:bg-muted")}>{children}</button>; }
function InfoBlock({ title, body }: { title: string; body: string }) { return <div className="rounded-xl border border-border bg-background p-3"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3><p className="mt-1.5 whitespace-pre-wrap text-sm leading-6">{body}</p></div>; }
function CodeLine({ label, value }: { label: string; value: string }) { return <div className="mt-2 min-w-0"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span><pre className="mt-1 max-w-full overflow-x-auto rounded-lg bg-muted p-2"><code>{value}</code></pre></div>; }
function EmptyProblem() { return <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center"><Send aria-hidden size={28} className="text-emerald-600" /><h2 className="mt-3 font-semibold">Your next challenge starts here</h2><p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">Tell the AI a topic or skill. It will create a precise problem, test cases, hints, and a compiler-ready solution.</p></div>; }
function ProblemSkeleton() { return <div className="space-y-3" aria-label="Generating problem"><div className="h-7 w-2/3 animate-pulse rounded bg-muted" /><div className="h-24 animate-pulse rounded-xl bg-muted" /><div className="grid grid-cols-2 gap-3"><div className="h-28 animate-pulse rounded-xl bg-muted" /><div className="h-28 animate-pulse rounded-xl bg-muted" /></div></div>; }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
