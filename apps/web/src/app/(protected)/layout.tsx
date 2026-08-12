import { AppShell } from "@/components/layout/app-shell";
import { IdleSessionGuard } from "@/components/auth/idle-session-guard";
import { adminService } from "@/core/admin/admin-container";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const [principal, profile] = await Promise.all([
    adminService.getPrincipalSafe(session.user.id),
    profileService.getByUserId(session.user.id),
  ]);

  return (
    <>
      <IdleSessionGuard />
      <AppShell
        userName={profile?.fullName ?? session.user.name}
        userImage={profile?.profilePictureUrl ?? session.user.image}
        showAdmin={Boolean(principal && principal.role !== "student")}
      >
        {children}
      </AppShell>
    </>
  );
}
