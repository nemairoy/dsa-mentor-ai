"use client";

import Link from "next/link";
import { BookOpen, Bot, Code2 } from "lucide-react";
import { useState } from "react";

import { PracticeAiHelper } from "@/components/practice/practice-ai-helper";
import { PracticeCodeRunner } from "@/components/practice/practice-code-runner";
import { PremiumCard } from "@/components/shared/premium-card";
import type { PracticeProblem } from "@/core/intelligence/domain/intelligence";
import { cn } from "@/lib/utils";

type PanelMode = "executor" | "ai";

export function PracticeWorkspacePanel({ problem }: { problem: PracticeProblem }) {
  const [mode, setMode] = useState<PanelMode>("executor");
  const [validationPrompt, setValidationPrompt] = useState("");
  const [validationNonce, setValidationNonce] = useState(0);

  function validateWithAi(prompt: string) {
    setValidationPrompt(prompt);
    setValidationNonce((current) => current + 1);
    setMode("ai");
  }

  return (
    <aside className="space-y-3 xl:sticky xl:top-16 xl:self-start">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-1 shadow-sm">
        <WorkspaceTab icon={Code2} label="Executor" active={mode === "executor"} onClick={() => setMode("executor")} />
        <WorkspaceTab icon={Bot} label="AI Help" active={mode === "ai"} onClick={() => setMode("ai")} />
      </div>

      {mode === "executor" ? (
        <PracticeCodeRunner problem={problem} onValidateWithAi={validateWithAi} />
      ) : (
        <PracticeAiHelper problem={problem} validationPrompt={validationPrompt} validationNonce={validationNonce} />
      )}

      <PremiumCard>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen aria-hidden={true} size={17} />
          Related lesson
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Review the exact topic before solving this coding problem.</p>
        <Link href={`/learn/${problem.chapterSlug}/${problem.lessonSlug}`} className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted">
          Open lesson
        </Link>
      </PremiumCard>
    </aside>
  );
}

function WorkspaceTab({ icon: Icon, label, active, onClick }: { icon: typeof Code2; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon aria-hidden={true} size={15} />
      {label}
    </button>
  );
}
