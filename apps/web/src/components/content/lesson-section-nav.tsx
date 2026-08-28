import { List } from "lucide-react";

const sections = [
  ["theory", "Theory"], ["visualization", "Concept picture"], ["example", "Guided example"], ["code", "Code"],
  ["time-complexity", "Complexity"], ["common-mistakes", "Common mistakes"], ["interview-tips", "Interview tips"],
  ["practice", "Practice"], ["quiz", "Quiz"], ["revision", "Revision"],
] as const;

export function LessonSectionNav() {
  return (
    <nav className="hidden rounded-xl border border-border bg-card p-3 shadow-sm xl:block" aria-label="Lesson sections">
      <div className="flex items-center gap-2"><List aria-hidden size={15} className="text-emerald-700 dark:text-emerald-300" /><h2 className="text-xs font-semibold uppercase tracking-[0.12em]">On this page</h2></div>
      <div className="mt-3 grid gap-0.5">
        {sections.map(([href, label]) => <a key={href} href={`#${href}`} className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground">{label}</a>)}
      </div>
    </nav>
  );
}
