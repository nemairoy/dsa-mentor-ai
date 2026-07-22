"use client";

import { Bot } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type AiAssistantLazyPanelProps = {
  chapterSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonMarkdown: string;
};

const AiAssistantPanel = dynamic(
  () => import("@/components/content/ai-assistant-panel").then((module) => module.AiAssistantPanel),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground shadow-sm">
        Loading AI tutor...
      </section>
    ),
  },
);

export function AiAssistantLazyPanel(props: AiAssistantLazyPanelProps) {
  const [open, setOpen] = useState(false);

  if (open) {
    return <AiAssistantPanel {...props} />;
  }

  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Bot aria-hidden={true} size={16} />
        </span>
        <div>
          <h2 className="text-sm font-semibold">AI Tutor</h2>
          <p className="text-xs text-muted-foreground">Load the tutor only when you need help.</p>
        </div>
      </div>
      <Button type="button" className="mt-3 w-full" variant="outline" onClick={() => setOpen(true)}>
        Open AI tutor
      </Button>
    </section>
  );
}
