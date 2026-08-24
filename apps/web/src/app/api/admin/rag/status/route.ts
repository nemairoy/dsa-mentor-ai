import { NextResponse } from "next/server";

import { adminService } from "@/core/admin/admin-container";
import { internalApiFetch } from "@/lib/internal-api";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  await adminService.requireAdmin(session.user.id, "rag:*");
  const response = await internalApiFetch("/api/v1/rag/index/status");
  return NextResponse.json(await response.json(), { status: response.status });
}
