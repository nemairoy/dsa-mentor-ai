import { PageHeader } from "@/components/layout/page-header";
import { adminService } from "@/core/admin/admin-container";
import { requireAdmin } from "@/lib/admin-session";

export default async function AdminUsersPage() {
  await requireAdmin("users:read");
  const users = await adminService.listUsers();

  return (
    <>
      <PageHeader title="User Management" description="View users, roles, learning progress, achievements, and platform activity." />
      <div className="space-y-3">
        {users.map((user) => (
          <section key={user.id} className="rounded-lg border border-border bg-card p-3.5">
            <p className="font-semibold">{user.name ?? "Unnamed user"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-2 text-xs uppercase text-muted-foreground">Role: {user.role_id ?? "student"}</p>
          </section>
        ))}
      </div>
    </>
  );
}
