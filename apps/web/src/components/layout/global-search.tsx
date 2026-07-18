"use client";

import Link from "next/link";
import { BookOpen, Bookmark, Bot, Dumbbell, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const searchableItems = [
  { href: "/learn", title: "Learn DSA with AI", type: "Lessons", icon: BookOpen },
  { href: "/practice", title: "Practice problems", type: "Practice", icon: Dumbbell },
  { href: "/ai-tutor", title: "AI Tutor", type: "AI", icon: Bot },
  { href: "/bookmarks", title: "Bookmarks", type: "Saved", icon: Bookmark },
  { href: "/visualizations", title: "Visualizations", type: "Visual", icon: Sparkles },
];

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => searchableItems.filter((item) => `${item.title} ${item.type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5),
    [query],
  );

  return (
    <div className="relative w-full max-w-xl">
      <label className="relative block">
        <Search aria-hidden={true} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search lessons, practice, visualizations..."
          className="h-9 w-full rounded-xl border border-input bg-background/80 pl-10 pr-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      {query ? (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
          {results.length ? (
            results.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setQuery("")}
                className="flex items-center gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0 hover:bg-muted"
              >
                <item.icon aria-hidden={true} size={17} className="text-emerald-700 dark:text-emerald-300" />
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.type}</span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No matching workspace items.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
