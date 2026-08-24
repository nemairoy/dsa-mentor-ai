import { NextResponse } from "next/server";

import { adminService } from "@/core/admin/admin-container";
import { internalApiFetch } from "@/lib/internal-api";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  await adminService.requireAdmin(session.user.id, "analytics:read");
  const ragResponse = await internalApiFetch("/api/v1/rag/index/status").catch(() => null);
  const rag = ragResponse?.ok ? await ragResponse.json() : { chunks: 0, indexed_lessons: 0 };
  const overview = await adminService.overview({
    chunks: rag.chunks ?? 0,
    indexedLessons: rag.indexed_lessons ?? rag.indexedLessons ?? 0,
  });
  return NextResponse.json({ overview });
}
