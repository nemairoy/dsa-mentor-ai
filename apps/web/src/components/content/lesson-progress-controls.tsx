"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type LessonProgressControlsProps = {
  chapterSlug: string;
  lessonSlug: string;
  initialProgress: number;
  initialStatus: "not_started" | "started" | "completed";
  nextLesson: { href: string; title: string } | null;
};

export function LessonProgressControls({ chapterSlug, lessonSlug, initialProgress, initialStatus, nextLesson }: LessonProgressControlsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [progress, setProgress] = useState(initialProgress);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialStatus !== "not_started") return;
    const controller = new AbortController();
    void fetch("/api/learning/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterSlug, lessonSlug, progressPercent: 10, status: "started" }),
      signal: controller.signal,
    }).then((response) => {
      if (response.ok) {
        setStatus("started");
        setProgress(10);
      }
    }).catch(() => undefined);
    return () => controller.abort();
  }, [chapterSlug, initialStatus, lessonSlug]);

  async function completeLesson() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterSlug, lessonSlug, progressPercent: 100, status: "completed" }),
      });
      if (!response.ok) throw new Error("Progress could not be saved.");
      setStatus("completed");
      setProgress(100);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Progress could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full min-w-0 rounded-xl border border-border bg-background/70 p-3 lg:w-[310px]">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold">Lesson progress</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Lesson progress">
        <div className="h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {status === "completed" ? (
          <div className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-emerald-500/15 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-200"><CheckCircle2 aria-hidden size={15} />Completed</div>
        ) : (
          <Button type="button" size="sm" disabled={saving} onClick={() => void completeLesson()}>{saving ? <Loader2 aria-hidden className="animate-spin" size={15} /> : <CheckCircle2 aria-hidden size={15} />}{saving ? "Saving..." : "Mark complete"}</Button>
        )}
        {nextLesson ? <Link href={nextLesson.href} className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold transition hover:bg-muted">Next lesson<ChevronRight aria-hidden size={14} /></Link> : null}
      </div>
      {error ? <p role="alert" className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
