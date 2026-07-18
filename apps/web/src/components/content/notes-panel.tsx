"use client";

import { Save } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type NotesPanelProps = {
  chapterSlug: string;
  lessonSlug: string;
  initialNote: string;
};

export function NotesPanel({ chapterSlug, lessonSlug, initialNote }: NotesPanelProps) {
  const [body, setBody] = useState(initialNote);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function saveNote() {
    setStatus("saving");
    const response = await fetch("/api/learning/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterSlug, lessonSlug, body }),
    });

    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <h2 className="text-xs font-semibold uppercase text-muted-foreground">Personal Notes</h2>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="mt-3 min-h-32 w-full resize-y rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Write your lesson notes here..."
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <Button type="button" size="sm" onClick={saveNote} disabled={status === "saving"}>
          <Save aria-hidden={true} size={16} />
          {status === "saving" ? "Saving..." : "Save notes"}
        </Button>
        {status === "saved" ? <span className="text-xs text-muted-foreground">Saved</span> : null}
        {status === "error" ? <span className="text-xs text-destructive">Could not save</span> : null}
      </div>
    </section>
  );
}
