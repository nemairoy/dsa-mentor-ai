"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Languages, ListChecks } from "lucide-react";

import type { Lesson } from "@/core/content/domain/content";
import { buildLearningModel, translateModel, type LanguageKey } from "@/components/content/lesson-learning-model";
import { cn } from "@/lib/utils";

const languages: Array<{ key: LanguageKey; label: string }> = [
  { key: "en", label: "English" },
  { key: "bn", label: "Bangla" },
  { key: "hi", label: "Hindi" },
];

export function LessonExampleCard({ lesson }: { lesson: Lesson }) {
  const [language, setLanguage] = useState<LanguageKey>("en");
  const model = useMemo(() => buildLearningModel(lesson), [lesson]);
  const copy = useMemo(() => translateModel(model, language), [model, language]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%)] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
              <ListChecks aria-hidden={true} size={13} />
              Guided example
            </div>
            <h3 className="mt-3 text-lg font-semibold tracking-normal">{copy.title}</h3>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">{copy.intro}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-card p-1">
            <Languages aria-hidden={true} size={15} className="ml-1 text-muted-foreground" />
            {languages.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setLanguage(item.key)}
                className={cn(
                  "min-h-8 rounded-lg px-3 text-xs font-semibold transition",
                  language === item.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-pressed={language === item.key}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{copy.goalLabel}</p>
            <p className="mt-2 text-sm leading-6">{copy.goal}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <InfoBlock label={copy.stateLabel} value={copy.state} />
              <InfoBlock label={copy.ruleLabel} value={copy.rule} />
            </div>
          </div>

          <div className="grid gap-3">
            {copy.examples.map((example) => (
              <div key={example.title} className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <p className="text-sm font-semibold leading-5">{example.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{example.body}</p>
                <code className="mt-3 block whitespace-pre-wrap rounded-lg bg-background px-3 py-2 text-xs font-semibold leading-5">
                  {example.trace}
                </code>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {copy.steps.map((step, index) => (
            <div key={step.title} className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold">{step.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  <div className="mt-3 flex max-w-full items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs">
                    <ArrowRight aria-hidden={true} size={13} className="shrink-0 text-emerald-700 dark:text-emerald-300" />
                    <span className="min-w-0 whitespace-pre-wrap break-words leading-5">{step.state}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-emerald-500/25 bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-400/10 dark:text-emerald-100">
            <div className="flex gap-3">
              <CheckCircle2 aria-hidden={true} size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{copy.rememberLabel}</p>
                <p className="mt-1 text-xs leading-5 opacity-85">{copy.remember}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs leading-5">{value}</p>
    </div>
  );
}
