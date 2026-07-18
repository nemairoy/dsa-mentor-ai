"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function AiAuthoringPanel() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate(feature: string) {
    setLoading(true);
    const response = await fetch("/api/admin/ai/author", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature, prompt }),
    });
    const payload = (await response.json()) as { output?: string; detail?: string };
    setOutput(payload.output ?? payload.detail ?? "");
    setLoading(false);
  }

  return (
    <section className="rounded-lg border border-border bg-card p-3.5">
      <h2 className="font-semibold">AI Content Authoring</h2>
      <p className="mt-1 text-sm text-muted-foreground">Generated content must be reviewed before publishing.</p>
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        className="mt-4 min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Describe the content to generate or improve..."
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {["lesson_draft", "examples", "code", "practice_problems", "interview_questions", "revision_notes", "flashcards", "quiz", "metadata_suggestions"].map((feature) => (
          <Button key={feature} type="button" variant="outline" size="sm" disabled={loading || !prompt} onClick={() => generate(feature)}>
            <Sparkles aria-hidden="true" size={16} />
            {feature.replaceAll("_", " ")}
          </Button>
        ))}
      </div>
      {output ? <pre className="mt-4 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{output}</pre> : null}
    </section>
  );
}
