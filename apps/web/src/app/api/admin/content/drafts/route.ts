import { NextResponse } from "next/server";

import { adminService } from "@/core/admin/admin-container";
import { contentDraftSchema } from "@/core/admin/domain/admin";
import { parseJsonRequest } from "@/lib/parse-json-request";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  await adminService.requireAdmin(session.user.id, "content:read");
  const drafts = await adminService.listDrafts();
  return NextResponse.json({ drafts });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  await adminService.requireAdmin(session.user.id, "content:write");
  const parsed = await parseJsonRequest(request, contentDraftSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;
  const draft = await adminService.saveDraft(session.user.id, body);
  return NextResponse.json({ draft }, { status: 201 });
}
