"use client";

import { Bot, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { PracticeProblem } from "@/core/intelligence/domain/intelligence";
import { cn } from "@/lib/utils";

type Message = {
  role: "assistant" | "user";
  body: string;
};

type PracticeAiHelperProps = {
  problem: PracticeProblem;
  validationPrompt?: string;
  validationNonce?: number;
};

export function PracticeAiHelper({ problem, validationPrompt, validationNonce }: PracticeAiHelperProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", body: "Ask for a hint, edge case, approach, or complexity explanation. I will not write the full solution unless you ask for it." },
  ]);

  const askAi = useCallback(async (prompt: string) => {
    const outgoing = prompt.trim();
    if (!outgoing) return;

    setMessages((current) => [...current, { role: "user", body: outgoing }]);
    setQuestion("");
    setLoading(true);

    const context = [
      `Problem: ${problem.title}`,
      `Difficulty: ${problem.difficulty}`,
      `Topic: ${problem.topic} / ${problem.subtopic}`,
      `Description: ${problem.explanation}`,
      `Function: ${problem.judgeMetadata.functionName ?? "solve"}`,
      `Test cases: ${JSON.stringify(problem.testCases)}`,
      `Hints: ${problem.hints.join(" | ")}`,
      "When code is requested, return complete runnable code inside a fenced markdown code block with the correct language name.",
      "Format explanations with short paragraphs and bullets. Do not put code in a single inline paragraph.",
    ].join("\n");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "follow_up",
          chapterSlug: problem.chapterSlug,
          lessonSlug: problem.lessonSlug,
          lessonTitle: problem.title,
          lessonMarkdown: context,
          question: outgoing,
        }),
      });
      const payload = (await response.json()) as { answer?: string; detail?: string };
      setMessages((current) => [...current, { role: "assistant", body: normalizeAiMarkdown(payload.answer ?? payload.detail ?? "I could not generate help for this problem.") }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", body: "AI help is unavailable right now. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }, [problem]);

  useEffect(() => {
    if (!validationPrompt || !validationNonce) return;
    const timer = window.setTimeout(() => {
      void askAi(validationPrompt);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [askAi, validationNonce, validationPrompt]);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Bot aria-hidden={true} size={16} />
          </span>
          <div>
            <h2 className="text-sm font-semibold">AI Problem Help</h2>
            <p className="text-xs text-muted-foreground">Hints, approach, and complexity help</p>
          </div>
        </div>
      </div>
      <div className="max-h-96 space-y-2 overflow-y-auto overflow-x-hidden p-3">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`min-w-0 rounded-xl px-3 py-2 text-xs leading-5 ${message.role === "user" ? "ml-8 bg-primary text-primary-foreground" : "mr-4 border border-border bg-background"}`}>
            {message.role === "user" ? <p className="whitespace-pre-wrap break-words">{message.body}</p> : <AiMarkdown markdown={message.body} />}
          </div>
        ))}
        {loading ? <p className="text-xs text-muted-foreground">AI is thinking...</p> : null}
      </div>
      <div className="border-t border-border p-3">
        <div className="mb-2 grid grid-cols-2 gap-2">
          {["Give me a hint", "Explain the approach", "Check edge cases", "Explain complexity"].map((prompt) => (
            <button key={prompt} type="button" disabled={loading} onClick={() => void askAi(prompt)} className="rounded-lg border border-border px-2 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50">
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex gap-2 rounded-xl border border-input bg-background p-2">
          <textarea
            value={question}
            rows={1}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask for help on this problem..."
            className="max-h-24 min-h-8 flex-1 resize-none bg-transparent px-1 py-1.5 text-xs outline-none"
          />
          <Button type="button" size="icon" disabled={loading || !question.trim()} onClick={() => void askAi(question)} aria-label="Ask AI">
            <Send aria-hidden={true} size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}

function AiMarkdown({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ className, ...props }) => <p className={cn("mb-2 last:mb-0 break-words", className)} {...props} />,
        ul: ({ className, ...props }) => <ul className={cn("mb-2 list-disc space-y-1 pl-5", className)} {...props} />,
        ol: ({ className, ...props }) => <ol className={cn("mb-2 list-decimal space-y-1 pl-5", className)} {...props} />,
        li: ({ className, ...props }) => <li className={cn("break-words", className)} {...props} />,
        h1: ({ className, ...props }) => <h3 className={cn("mb-2 text-sm font-semibold", className)} {...props} />,
        h2: ({ className, ...props }) => <h3 className={cn("mb-2 text-sm font-semibold", className)} {...props} />,
        h3: ({ className, ...props }) => <h3 className={cn("mb-2 text-xs font-semibold", className)} {...props} />,
        code: ({ className, children, ...props }) => {
          const language = className?.startsWith("language-") ? className.slice("language-".length) : "";
          if (language) {
            return (
              <pre className="my-2 max-w-full overflow-x-auto rounded-lg border border-border bg-muted p-3 text-[11px] leading-5">
                <code className={className} {...props}>{children}</code>
              </pre>
            );
          }
          return <code className="break-words rounded bg-muted px-1 py-0.5 text-[11px]" {...props}>{children}</code>;
        },
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}

function normalizeAiMarkdown(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/```(\w+)\s+([^\n`])/g, "```$1\n$2")
    .replace(/```([^\n`]*#include)/g, "```cpp\n$1")
    .replace(/(```(?:cpp|c\+\+|c|python|java|javascript|js)?)([^\n])/gi, "$1\n$2")
    .replace(/([^\n])```/g, "$1\n```")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
