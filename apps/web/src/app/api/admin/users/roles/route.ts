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

  const principal = await adminService.getPrincipal(session.user.id);
  if (!principal || principal.role !== "super_administrator") {
    return NextResponse.json({ detail: "Only a super administrator can change user roles" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ detail: "Enter a valid user and role" }, { status: 400 });
  }
  const body = parsed.data;
  if (body.userId === session.user.id) {
    return NextResponse.json({ detail: "You cannot change your own administrator role" }, { status: 400 });
  }
  await adminService.assignRole(session.user.id, body.userId, body.roleId);
  return NextResponse.json({ ok: true });
}
