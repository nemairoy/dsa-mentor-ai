import Link from "next/link";
import { BookOpen, FileText, Pin, Search } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PremiumCard } from "@/components/shared/premium-card";

const folders = ["Pinned", "Arrays", "Graphs", "Dynamic Programming"];

export default function NotesPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Notes" description="A clean notebook for lesson notes, revision snippets, and interview reminders." />
      <section className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <PremiumCard>
            <label className="relative block">
              <Search aria-hidden={true} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className="h-9 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Search notes" />
            </label>
          </PremiumCard>
          <PremiumCard>
            <h2 className="text-sm font-semibold">Folders</h2>
            <div className="mt-3 space-y-1.5">
              {folders.map((folder) => (
                <button key={folder} type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted">
                  <FileText aria-hidden={true} size={16} />
                  {folder}
                </button>
              ))}
            </div>
          </PremiumCard>
        </aside>
        <PremiumCard className="min-h-[460px]">
          <div className="flex flex-col gap-3 border-b border-border pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold">Pinned revision note</h2>
              <p className="text-xs text-muted-foreground">Markdown-style preview for quick study sessions.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <Pin aria-hidden={true} size={14} />
              Autosave ready
            </span>
          </div>
          <article className="prose prose-slate mt-4 max-w-none text-sm dark:prose-invert">
            <h3>How to use notes effectively</h3>
            <p>Open any lesson and write short takeaways in the pinned notes panel. Keep notes concise: definition, example, complexity, and one mistake to avoid.</p>
            <pre className="rounded-2xl bg-muted p-3 text-sm"><code>Array access: O(1)
Array insertion in middle: O(n)
Reason: elements may need shifting</code></pre>
          </article>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <Link href="/learn" className="rounded-xl border border-border p-3 transition hover:bg-muted">
              <BookOpen aria-hidden={true} size={20} />
              <p className="mt-3 font-medium">Open lessons</p>
              <p className="mt-1 text-sm text-muted-foreground">Write notes beside actual content.</p>
            </Link>
            <div className="rounded-xl border border-dashed border-border p-3">
              <p className="font-medium">Markdown preview</p>
              <p className="mt-1 text-sm text-muted-foreground">Headings, lists, and code blocks are styled for revision.</p>
            </div>
          </div>
        </PremiumCard>
      </section>
    </div>
  );
}
