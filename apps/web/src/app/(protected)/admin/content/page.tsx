import { AiAuthoringPanel } from "@/components/admin/ai-authoring-panel";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { PageHeader } from "@/components/layout/page-header";
import { adminService } from "@/core/admin/admin-container";
import { requireAdmin } from "@/lib/admin-session";

export default async function AdminContentPage() {
  await requireAdmin("content:read");
  const drafts = await adminService.listDrafts();

  return (
    <>
      <PageHeader title="Content Management" description="Edit lessons, metadata, code examples, AI metadata, and animation mappings." />
      <div className="space-y-4">
        <MarkdownEditor />
        <AiAuthoringPanel />
        <section className="rounded-lg border border-border bg-card p-3">
          <h2 className="font-semibold">Drafts and Version History</h2>
          <div className="mt-4 space-y-2">
            {drafts.length ? (
              drafts.map((draft) => (
                <div key={draft.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium">{draft.title}</p>
                  <p className="text-muted-foreground">{draft.content_type} · {draft.status}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No drafts yet.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
