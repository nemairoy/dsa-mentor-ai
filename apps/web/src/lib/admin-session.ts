import { redirect } from "next/navigation";

import { AdminAccessError } from "@/core/admin/application/admin-service";
import { adminService } from "@/core/admin/admin-container";
import { requireSession } from "@/lib/session";

export async function requireAdmin(permission?: string) {
  const session = await requireSession();

  try {
    const principal = await adminService.requireAdmin(session.user.id, permission);
    return { session, principal };
  } catch (error) {
    if (error instanceof AdminAccessError) {
      redirect("/dashboard");
    }
    throw error;
  }
}

