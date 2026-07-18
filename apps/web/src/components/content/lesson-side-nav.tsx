import Link from "next/link";

import { ProgressBar } from "@/components/shared/premium-card";

const sections = [
  "Theory",
  "Visualization",
  "Example",
  "Code",
  "Time Complexity",
  "Space Complexity",
  "Common Mistakes",
  "Interview Tips",
  "Practice",
  "Quiz",
  "Revision",
];

export function LessonSideNav({ progress }: { progress: number }) {
  return (
    <aside className="sticky top-20 rounded-xl border border-border bg-card p-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Lesson Navigation</p>
      <ProgressBar value={progress} className="mt-3" />
      <p className="mt-2 text-xs text-muted-foreground">{progress}% read</p>
      <nav className="mt-4 space-y-0.5" aria-label="Lesson sections">
        {sections.map((section) => (
          <Link
            key={section}
            href={`#${section.toLowerCase().replaceAll(" ", "-")}`}
            className="block rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {section}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
