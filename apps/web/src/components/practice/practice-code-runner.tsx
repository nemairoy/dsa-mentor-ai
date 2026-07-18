"use client";

import { Bot, CheckCircle2, Code2, Loader2, Play, Save, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { PracticeProblem } from "@/core/intelligence/domain/intelligence";
import { cn } from "@/lib/utils";

type Language = "python" | "java" | "cpp";

type ExecutionResult = {
  sample: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
};

type ExecutePayload = {
  ok: boolean;
  results: ExecutionResult[];
  detail?: string;
};

type PracticeCodeRunnerProps = {
  problem: PracticeProblem;
  onValidateWithAi: (prompt: string) => void;
};

const languages: Array<{ id: Language; label: string }> = [
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

export function PracticeCodeRunner({ problem, onValidateWithAi }: PracticeCodeRunnerProps) {
  const [language, setLanguage] = useState<Language>("python");
  const storageKey = `practice-code:${problem.id}:${language}`;
  const template = useMemo(() => buildTemplate(problem, language), [language, problem]);
  const [code, setCode] = useState(() => template);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [runError, setRunError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCode(window.localStorage.getItem(storageKey) ?? template);
      setResults([]);
      setRunError("");
      setSavedAt(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey, template]);

  useEffect(() => {
    if (!code.trim()) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, code);
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [code, storageKey]);

  async function runSamples() {
    setRunning(true);
    setRunError("");
    setResults([]);
    window.localStorage.setItem(storageKey, code);

    try {
      const response = await fetch("/api/practice/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          functionName: problem.judgeMetadata.functionName ?? "solve",
          testCases: problem.testCases,
        }),
      });
      const payload = (await response.json()) as ExecutePayload;
      if (!response.ok) {
        setRunError(payload.detail ?? "Execution failed.");
        return payload;
      }

      setResults(payload.results);
      if (payload.ok) {
        await fetch("/api/practice/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId: problem.id, status: "solved", timeSpentSeconds: 0, mistakes: [] }),
        });
      }
      return payload;
    } catch {
      setRunError("Executor is unavailable right now.");
      return null;
    } finally {
      setRunning(false);
    }
  }

  function selectLanguage(nextLanguage: Language) {
    const nextTemplate = buildTemplate(problem, nextLanguage);
    const nextStorageKey = `practice-code:${problem.id}:${nextLanguage}`;
    setLanguage(nextLanguage);
    setCode(window.localStorage.getItem(nextStorageKey) ?? nextTemplate);
    setResults([]);
    setRunError("");
    setSavedAt(null);
  }

  async function validateWithAi() {
    const payload = await runSamples();
    const executionSummary = payload?.results?.length
      ? payload.results.map((result) => `Sample ${result.sample}: ${result.passed ? "passed" : "failed"}; expected ${result.expected}; actual ${result.actual || result.error || "no output"}`).join("\n")
      : "No execution result was available.";

    onValidateWithAi([
      "Validate this student's code for the current practice problem.",
      "Check correctness against the problem statement and sample tests.",
      "Explain bugs clearly and suggest the smallest useful fix. Do not rewrite the full solution unless necessary.",
      "",
      `Language: ${languages.find((item) => item.id === language)?.label}`,
      `Problem: ${problem.title}`,
      `Statement: ${problem.explanation}`,
      `Function: ${problem.judgeMetadata.functionName ?? "solve"}`,
      `Sample tests: ${JSON.stringify(problem.testCases)}`,
      `Execution result:\n${executionSummary}`,
      "",
      "Student code:",
      "```" + language,
      code,
      "```",
    ].join("\n"));
  }

  const allPassed = results.length > 0 && results.every((result) => result.passed);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
            <Code2 aria-hidden={true} size={16} />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Code Executor</h2>
            <p className="text-xs text-muted-foreground">Write, autosave, run samples, then validate with AI</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-3">
        <div className="grid grid-cols-3 gap-2">
          {languages.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectLanguage(item.id)}
              className={cn(
                "rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors",
                language === item.id ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200" : "bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Save aria-hidden={true} size={14} />
            {savedAt ? `Autosaved ${savedAt}` : "Autosave ready"}
          </span>
          <span>{problem.testCases.length} samples</span>
        </div>

        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          spellCheck={false}
          className="min-h-[360px] w-full resize-y rounded-xl border border-border bg-background p-3 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-ring xl:min-h-[420px]"
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="outline" disabled={running} onClick={() => void runSamples()}>
            {running ? <Loader2 aria-hidden={true} className="animate-spin" size={15} /> : <Play aria-hidden={true} size={15} />}
            Run samples
          </Button>
          <Button type="button" disabled={running} onClick={() => void validateWithAi()}>
            <Bot aria-hidden={true} size={15} />
            Validate with AI
          </Button>
        </div>

        {runError ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{runError}</p> : null}

        {results.length ? (
          <div className="space-y-2">
            <div className={cn("rounded-lg border p-3 text-xs font-semibold", allPassed ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-200")}>
              {allPassed ? "All sample tests passed." : "Some sample tests need attention."}
            </div>
            {results.map((result) => (
              <div key={result.sample} className="rounded-xl border border-border bg-background p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">Sample {result.sample}</p>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium", result.passed ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200" : "bg-destructive/10 text-destructive")}>
                    {result.passed ? <CheckCircle2 aria-hidden={true} size={13} /> : <XCircle aria-hidden={true} size={13} />}
                    {result.passed ? "Passed" : "Failed"}
                  </span>
                </div>
                <div className="mt-2 grid gap-2">
                  <ResultLine label="Expected" value={result.expected} />
                  <ResultLine label="Actual" value={result.actual || result.error || "No output"} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <pre className="max-w-full overflow-x-auto rounded-lg bg-muted p-2"><code>{value}</code></pre>
    </div>
  );
}

function buildTemplate(problem: PracticeProblem, language: Language) {
  const functionName = problem.judgeMetadata.functionName ?? "solve";
  const params = parseParams(problem.testCases[0]?.input ?? "");

  if (language === "python") {
    return `def ${functionName}(${params.map((param) => param.name).join(", ")}):
    # Write your solution here.
    pass
`;
  }

  if (language === "java") {
    return `import java.util.*;

class Solution {
  static Object ${functionName}(${params.map((param) => `${javaType(param.value)} ${param.name}`).join(", ")}) {
    // Write your solution here.
    return null;
  }
}
`;
  }

  return `#include <bits/stdc++.h>
using namespace std;

// Keep the function name exactly as shown.
auto ${functionName}(${params.map((param) => `${cppType(param.value)} ${param.name}`).join(", ")}) {
  // Write your solution here.
}
`;
}

function parseParams(input: string) {
  return splitTopLevel(input).map((part) => {
    const index = part.indexOf("=");
    return {
      name: part.slice(0, index).trim() || "input",
      value: part.slice(index + 1).trim(),
    };
  }).filter((param) => param.name);
}

function splitTopLevel(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === quote && value[index - 1] !== "\\") quote = null;
      continue;
    }
    if (char === "'" || char === "\"") quote = char;
    if (char === "[" || char === "{" || char === "(") depth += 1;
    if (char === "]" || char === "}" || char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

function javaType(value: string) {
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) return "int";
  if (trimmed === "True" || trimmed === "False") return "boolean";
  if (trimmed.startsWith("[[") || trimmed.includes("],[")) return "List<List<Integer>>";
  if (trimmed.startsWith("[")) return "List<Integer>";
  return "String";
}

function cppType(value: string) {
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) return "int";
  if (trimmed === "True" || trimmed === "False") return "bool";
  if (trimmed.startsWith("[[") || trimmed.includes("],[")) return "vector<vector<int>>";
  if (trimmed.startsWith("[")) return "vector<int>";
  return "string";
}
