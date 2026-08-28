"use client";

import { Bookmark, BookmarkCheck, Check, Loader2, Printer, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type LessonActionsProps = {
  chapterSlug: string;
  lessonSlug: string;
  initialBookmarked: boolean;
};

export function LessonActions({ chapterSlug, lessonSlug, initialBookmarked }: LessonActionsProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function toggleBookmark() {
    const nextBookmarked = !bookmarked;
    setBookmarked(nextBookmarked);
    setSaving(true);
    setFeedback("");
    try {
      const response = await fetch("/api/learning/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterSlug, lessonSlug, bookmarked: nextBookmarked }),
      });
      if (!response.ok) throw new Error("Bookmark could not be saved");
      setFeedback(nextBookmarked ? "Saved to bookmarks" : "Bookmark removed");
    } catch {
      setBookmarked(bookmarked);
      setFeedback("Bookmark could not be saved");
    } finally {
      setSaving(false);
    }
  }

  async function shareLesson() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        setFeedback("Shared");
        return;
      }
      await navigator.clipboard.writeText(url);
      setFeedback("Link copied");
    } catch {
      setFeedback("Sharing was cancelled");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button type="button" variant="outline" size="sm" disabled={saving} onClick={toggleBookmark}>
        {saving ? <Loader2 aria-hidden className="animate-spin" size={16} /> : bookmarked ? <BookmarkCheck aria-hidden="true" size={16} /> : <Bookmark aria-hidden="true" size={16} />}
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={shareLesson}>
        <Share2 aria-hidden="true" size={16} />
        Share
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
        <Printer aria-hidden="true" size={16} />
        Print
      </Button>
      {feedback ? <span role="status" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Check aria-hidden size={12} />{feedback}</span> : null}
    </div>
  );
}
