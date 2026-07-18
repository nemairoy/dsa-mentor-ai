import { NextResponse } from "next/server";
import { z } from "zod";

import { adminService } from "@/core/admin/admin-container";
import { adminRoleSchema } from "@/core/admin/domain/admin";
import { getCurrentSession } from "@/lib/session";

const bodySchema = z.object({
  userId: z.string().min(1),
  roleId: adminRoleSchema,
});

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ detail: "Authentication is required" }, { status: 401 });

  await adminService.requireAdmin(session.user.id, "users:read");
  const body = bodySchema.parse(await request.json());
  await adminService.assignRole(session.user.id, body.userId, body.roleId);
  return NextResponse.json({ ok: true });
}

