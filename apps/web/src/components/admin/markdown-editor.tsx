"use client";

import { Bold, Code, Heading, Image as ImageIcon, List, Save, Table } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";

export function MarkdownEditor({ initialMarkdown = "" }: { initialMarkdown?: string }) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const preview = useMemo(() => markdown, [markdown]);

  function insert(snippet: string) {
    setMarkdown((value) => `${value}${value ? "\n" : ""}${snippet}`);
  }

  async function saveDraft() {
    setStatus("saving");
    await fetch("/api/admin/content/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: "lesson",
        title: "Untitled Draft",
        markdown,
        metadata: { source: "cms", autosave: true },
        status: "draft",
      }),
    });
    setStatus("saved");
  }

  return (
    <section className="rounded-lg border border-border bg-card p-3.5">
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Button type="button" variant="outline" size="sm" onClick={() => insert("# Heading")}>
          <Heading aria-hidden="true" size={16} />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => insert("**bold text**")}>
          <Bold aria-hidden="true" size={16} />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => insert("- Item")}>
          <List aria-hidden="true" size={16} />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => insert("```python\nprint('hello')\n```")}>
          <Code aria-hidden="true" size={16} />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => insert("| A | B |\n| --- | --- |\n| 1 | 2 |")}>
          <Table aria-hidden="true" size={16} />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => insert("![Alt text](/image.png)")}>
          <ImageIcon aria-hidden="true" size={16} />
        </Button>
        <Button type="button" size="sm" onClick={saveDraft}>
          <Save aria-hidden="true" size={16} />
          {status === "saving" ? "Saving" : status === "saved" ? "Saved" : "Autosave Draft"}
        </Button>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <textarea
          value={markdown}
          onChange={(event) => setMarkdown(event.target.value)}
          className="min-h-96 w-full rounded-md border border-input bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Write Markdown lesson content..."
        />
        <article className="min-h-96 rounded-md border border-border bg-background p-3.5 text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{preview || "Live preview"}</ReactMarkdown>
        </article>
      </div>
    </section>
  );
}
