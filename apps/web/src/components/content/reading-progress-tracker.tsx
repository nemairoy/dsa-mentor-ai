"use client";

import { useEffect, useRef, useState } from "react";

type ReadingProgressTrackerProps = {
  chapterSlug: string;
  lessonSlug: string;
  initialProgress: number;
};

export function ReadingProgressTracker({ chapterSlug, lessonSlug, initialProgress }: ReadingProgressTrackerProps) {
  const [progress, setProgress] = useState(initialProgress);
  const lastSentRef = useRef({ progress: -1, sentAt: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sendProgress = (nextProgress: number) => {
      const now = Date.now();
      const previous = lastSentRef.current;
      const isComplete = nextProgress >= 90;
      const changedEnough = Math.abs(nextProgress - previous.progress) >= 10;
      const waitedEnough = now - previous.sentAt >= 15_000;

      if (!isComplete && !changedEnough && !waitedEnough) return;
      if (isComplete && previous.progress >= 90 && now - previous.sentAt < 60_000) return;

      lastSentRef.current = { progress: nextProgress, sentAt: now };

      void fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          chapterSlug,
          lessonSlug,
          progressPercent: nextProgress,
          status: isComplete ? "completed" : "started",
        }),
      }).catch(() => {
        // Reading progress is opportunistic; the next throttled event can retry.
      });
    };

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      setProgress(nextProgress);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => sendProgress(nextProgress), 700);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [chapterSlug, lessonSlug]);

  return (
    <div className="mb-4 rounded-xl border border-border bg-background p-2.5">
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Reading progress</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
