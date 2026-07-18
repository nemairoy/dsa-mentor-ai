import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { adminService } from "@/core/admin/admin-container";
import { env } from "@/infrastructure/config/env";
import { requireAdmin } from "@/lib/admin-session";

export default async function AdminPage() {
  await requireAdmin("analytics:read");
  const ragResponse = await fetch(`${env.API_BASE_URL}/api/v1/rag/index/status`, { cache: "no-store" }).catch(() => null);
  const rag = ragResponse?.ok ? await ragResponse.json() : { chunks: 0, indexed_lessons: 0 };
  const overview = await adminService.overview({
    chunks: rag.chunks ?? 0,
    indexedLessons: rag.indexed_lessons ?? rag.indexedLessons ?? 0,
  });

  return (
    <>
      <PageHeader title="Admin Studio" description="Internal CMS, analytics, AI authoring, search, and RAG management." />
      <AdminDashboard overview={overview} />
    </>
  );
}

