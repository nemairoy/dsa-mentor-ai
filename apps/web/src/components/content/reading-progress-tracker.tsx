"use client";

import { useEffect, useState } from "react";

type ReadingProgressTrackerProps = {
  chapterSlug: string;
  lessonSlug: string;
  initialProgress: number;
};

export function ReadingProgressTracker({ chapterSlug, lessonSlug, initialProgress }: ReadingProgressTrackerProps) {
  const [progress, setProgress] = useState(initialProgress);

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      setProgress(nextProgress);

      void fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterSlug,
          lessonSlug,
          progressPercent: nextProgress,
          status: nextProgress >= 90 ? "completed" : "started",
        }),
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
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
