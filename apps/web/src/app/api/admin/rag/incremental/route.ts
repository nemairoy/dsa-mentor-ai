import { NextResponse } from "next/server";

import { adminService } from "@/core/admin/admin-container";
import { env } from "@/infrastructure/config/env";
import { getCurrentSession } from "@/lib/session";

export async function POST() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  await adminService.requireAdmin(session.user.id, "rag:*");
  const response = await fetch(`${env.API_BASE_URL}/api/v1/rag/index/incremental`, { method: "POST" });
  return NextResponse.json(await response.json(), { status: response.status });
}

