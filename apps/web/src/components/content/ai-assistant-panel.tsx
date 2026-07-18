"use client";

import { Bot, MessageCircle, Send, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { AiFeature } from "@/core/ai/domain/ai";
import { cn } from "@/lib/utils";

const actions: Array<{ feature: AiFeature; label: string; prompt: string }> = [
  { feature: "explain_lesson", label: "Explain again", prompt: "Explain this topic again in simple words." },
  { feature: "summary", label: "Simplify", prompt: "Simplify this topic for a beginner." },
  { feature: "revision_notes", label: "Real example", prompt: "Give me a real-world example for this topic." },
  { feature: "mcq_quiz", label: "Quiz", prompt: "Generate a short quiz for this topic." },
  { feature: "flashcards", label: "Flashcards", prompt: "Generate flashcards for this topic." },
  { feature: "interview_questions", label: "Compare", prompt: "Compare this topic with related algorithms or patterns." },
];

type ChatMessage = {
  role: "assistant" | "user";
  body: string;
};

type AiAssistantPanelProps = {
  chapterSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonMarkdown: string;
};

export function AiAssistantPanel({ chapterSlug, lessonSlug, lessonTitle, lessonMarkdown }: AiAssistantPanelProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      body: "Ask me to explain this topic simply, create an example, quiz you, or compare it with another DSA idea.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function runAi(feature: AiFeature, customQuestion: string) {
    const outgoing = customQuestion.trim();
    if (!outgoing) return;

    setMessages((current) => [...current, { role: "user", body: outgoing }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature,
          chapterSlug,
          lessonSlug,
          lessonTitle,
          lessonMarkdown,
          question: outgoing,
        }),
      });
      const payload = (await response.json()) as { answer?: string; detail?: string };
      setMessages((current) => [
        ...current,
        { role: "assistant", body: normalizeAiMarkdown(payload.answer ?? payload.detail ?? "I could not generate an answer. Try a shorter question.") },
      ]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", body: "Something went wrong while generating. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" aria-label="AI assistant">
      <div className="border-b border-border bg-card p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Bot aria-hidden={true} size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold">AI Tutor</h2>
            <p className="text-xs text-muted-foreground">Lesson-aware assistant</p>
          </div>
        </div>
      </div>

      <div className="max-h-[380px] space-y-2.5 overflow-y-auto overflow-x-hidden bg-background/50 p-3">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" ? (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Bot aria-hidden={true} size={14} />
              </div>
            ) : null}
            <div
              className={`max-w-[88%] overflow-hidden rounded-xl px-3 py-2 text-xs leading-5 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground"
              }`}
            >
              <AiMessageContent markdown={message.body} user={message.role === "user"} />
            </div>
            {message.role === "user" ? (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <User aria-hidden={true} size={14} />
              </div>
            ) : null}
          </div>
        ))}
        {loading ? (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            <span className="flex gap-1" aria-hidden={true}>
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
            </span>
            AI is arranging the answer...
          </div>
        ) : null}
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Sparkles aria-hidden={true} size={14} />
          Suggested prompts
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={loading}
              onClick={() => runAi(action.feature, action.prompt)}
              className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium transition hover:bg-muted disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-2">
          <MessageCircle aria-hidden={true} size={18} className="mb-2 ml-1 text-muted-foreground" />
          <textarea
            value={question}
            rows={1}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void runAi("follow_up", question);
              }
            }}
            onKeyUp={(event) => event.stopPropagation()}
            className="max-h-28 min-h-8 flex-1 resize-none bg-transparent px-1 py-1.5 text-xs outline-none"
            placeholder="Ask anything about this topic..."
          />
          <Button
            type="button"
            size="icon"
            className="shrink-0 rounded-xl"
            disabled={loading || !question.trim()}
            onClick={() => runAi("follow_up", question)}
            aria-label="Ask AI Tutor"
          >
            <Send aria-hidden={true} size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}

function AiMessageContent({ markdown, user }: { markdown: string; user: boolean }) {
  if (user) {
    return <p className="whitespace-pre-wrap break-words">{markdown}</p>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ className, ...props }) => <p className={cn("mb-2 last:mb-0 break-words", className)} {...props} />,
        ul: ({ className, ...props }) => <ul className={cn("mb-2 list-disc space-y-1 pl-5", className)} {...props} />,
        ol: ({ className, ...props }) => <ol className={cn("mb-2 list-decimal space-y-1 pl-5", className)} {...props} />,
        li: ({ className, ...props }) => <li className={cn("break-words", className)} {...props} />,
        h1: ({ className, ...props }) => <h3 className={cn("mb-2 text-base font-semibold", className)} {...props} />,
        h2: ({ className, ...props }) => <h3 className={cn("mb-2 text-base font-semibold", className)} {...props} />,
        h3: ({ className, ...props }) => <h3 className={cn("mb-2 text-sm font-semibold", className)} {...props} />,
        code: ({ className, children, ...props }) => {
          const language = /language-(\w+)/.exec(className ?? "")?.[1];
          if (language) {
            return (
              <pre className="my-2 max-w-full overflow-x-auto rounded-2xl border border-border bg-background p-3 text-xs leading-5">
                <code className={className} {...props}>{children}</code>
              </pre>
            );
          }
          return <code className="rounded bg-muted px-1.5 py-0.5 text-xs" {...props}>{children}</code>;
        },
        pre: ({ children }) => <>{children}</>,
        table: ({ className, ...props }) => (
          <div className="my-2 max-w-full overflow-x-auto rounded-2xl border border-border">
            <table className={cn("w-full border-collapse text-xs", className)} {...props} />
          </div>
        ),
        th: ({ className, ...props }) => <th className={cn("border-b border-border bg-muted px-2 py-1 text-left", className)} {...props} />,
        td: ({ className, ...props }) => <td className={cn("border-b border-border px-2 py-1", className)} {...props} />,
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
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
