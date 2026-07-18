import { NextResponse } from "next/server";

import { adminService } from "@/core/admin/admin-container";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  await adminService.requireAdmin(session.user.id, "users:read");
  const users = await adminService.listUsers();
  return NextResponse.json({ users });
}

