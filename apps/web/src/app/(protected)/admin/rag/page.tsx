import { RagManagementPanel } from "@/components/admin/rag-management-panel";
import { PageHeader } from "@/components/layout/page-header";
import { requireAdmin } from "@/lib/admin-session";

export default async function AdminRagPage() {
  await requireAdmin("rag:*");

  return (
    <>
      <PageHeader title="RAG Management" description="Manage ChromaDB indexing, indexed chunks, incremental updates, and retrieval health." />
      <RagManagementPanel />
    </>
  );
}

