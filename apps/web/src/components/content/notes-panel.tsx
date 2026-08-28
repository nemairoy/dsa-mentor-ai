"use client";

import { Check, Save } from "lucide-react";
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
  const dirty = body !== initialNote && status !== "saved";

  async function saveNote() {
    setStatus("saving");
    try {
      const response = await fetch("/api/learning/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterSlug, lessonSlug, body }),
      });
      setStatus(response.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <h2 className="text-xs font-semibold uppercase text-muted-foreground">Personal Notes</h2>
      <textarea
        value={body}
        maxLength={20000}
        onChange={(event) => { setBody(event.target.value); setStatus("idle"); }}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            void saveNote();
          }
        }}
        className="mt-3 min-h-32 w-full resize-y rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Write your lesson notes here..."
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <Button type="button" size="sm" onClick={saveNote} disabled={status === "saving" || !dirty}>
          <Save aria-hidden={true} size={16} />
          {status === "saving" ? "Saving..." : "Save notes"}
        </Button>
        <span className="ml-auto text-[11px] text-muted-foreground">{body.length.toLocaleString()} / 20,000</span>
        {status === "saved" ? <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300"><Check aria-hidden size={13} />Saved</span> : null}
        {status === "error" ? <span className="text-xs text-destructive">Could not save</span> : null}
      </div>
    </section>
  );
}
