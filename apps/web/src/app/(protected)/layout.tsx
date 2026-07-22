import { AppShell } from "@/components/layout/app-shell";
import { adminService } from "@/core/admin/admin-container";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const [principal, profile] = await Promise.all([
    adminService.getPrincipal(session.user.id),
    profileService.getByUserId(session.user.id),
  ]);

  return (
    <AppShell
      userName={profile?.fullName ?? session.user.name}
      userImage={profile?.profilePictureUrl ?? session.user.image}
      showAdmin={Boolean(principal && principal.role !== "student")}
    >
      {children}
    </AppShell>
  );
}
