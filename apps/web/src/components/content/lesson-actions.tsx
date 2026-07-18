"use client";

import { Bookmark, BookmarkCheck, Printer, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type LessonActionsProps = {
  chapterSlug: string;
  lessonSlug: string;
  initialBookmarked: boolean;
};

export function LessonActions({ chapterSlug, lessonSlug, initialBookmarked }: LessonActionsProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  async function toggleBookmark() {
    const nextBookmarked = !bookmarked;
    setBookmarked(nextBookmarked);

    const response = await fetch("/api/learning/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterSlug, lessonSlug, bookmarked: nextBookmarked }),
    });

    if (!response.ok) {
      setBookmarked(bookmarked);
    }
  }

  async function shareLesson() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={toggleBookmark}>
        {bookmarked ? <BookmarkCheck aria-hidden="true" size={16} /> : <Bookmark aria-hidden="true" size={16} />}
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
    </div>
  );
}

