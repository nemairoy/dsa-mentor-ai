import type { Metadata } from "next";
import { CalendarDays, CircleUserRound, Mail, ShieldCheck, UsersRound } from "lucide-react";

import { BrandLockup } from "@/components/brand/brand-logo";
import { UserAccessButton } from "@/components/admin/user-access-button";
import { pool } from "@/infrastructure/database/postgres";
import { requireOwnerAdmin } from "@/lib/owner-admin-auth";

export const metadata: Metadata = {
  title: "Owner admin console",
  robots: { index: false, follow: false },
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  age: number | null;
  created_at: Date;
  is_logged_in: boolean;
  banned: boolean;
};

export default async function AdminConsolePage() {
  await requireOwnerAdmin();
  const result = await pool.query<AdminUser>(
    `SELECT u.id, u.name, u.email, up.age, u."createdAt" AS created_at,
       COALESCE(u."banned", FALSE) AS banned,
       EXISTS (
         SELECT 1 FROM "session" s
         WHERE s."userId" = u.id AND s."expiresAt" > NOW()
       ) AS is_logged_in
     FROM "user" u
     LEFT JOIN user_profiles up ON up.user_id = u.id
     ORDER BY u."createdAt" DESC
     LIMIT 500`,
  );
  const users = result.rows;
  const online = users.filter((user) => user.is_logged_in && !user.banned).length;
  const blocked = users.filter((user) => user.banned).length;
  const offline = users.length - online - blocked;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <BrandLockup subtitle="Owner administration" />
          <form action="/api/owner-admin/logout" method="post"><button className="h-9 rounded-lg border border-input px-3 text-sm font-medium hover:bg-muted">Sign out</button></form>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
        <div><div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-300"><ShieldCheck aria-hidden size={15} />Private owner view</div><h1 className="mt-2 text-3xl font-black tracking-tight">User administration</h1><p className="mt-1 text-sm text-muted-foreground">Account identity, profile information, creation time, and current login status.</p></div>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={UsersRound} label="Registered users" value={users.length} />
          <Stat icon={CircleUserRound} label="Currently logged in" value={online} tone="online" />
          <Stat icon={CalendarDays} label="Currently offline" value={offline} />
          <Stat icon={ShieldCheck} label="Blocked users" value={blocked} />
        </section>
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3"><h2 className="font-semibold">All users</h2><p className="mt-0.5 text-xs text-muted-foreground">Showing up to 500 newest accounts</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Age</th><th className="px-4 py-3">User ID</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Access</th></tr></thead>
              <tbody className="divide-y divide-border">{users.map((user) => <tr key={user.id} className="hover:bg-muted/30"><td className="px-4 py-3 font-semibold">{user.name}</td><td className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><Mail aria-hidden size={14} className="text-muted-foreground" />{user.email}</span></td><td className="px-4 py-3">{user.age ?? "Not provided"}</td><td className="max-w-64 px-4 py-3 font-mono text-xs text-muted-foreground"><span className="block truncate" title={user.id}>{user.id}</span></td><td className="px-4 py-3 whitespace-nowrap">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(user.created_at))}</td><td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${user.banned ? "bg-red-500/12 text-red-700 dark:text-red-300" : user.is_logged_in ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}><span className={`h-2 w-2 rounded-full ${user.banned ? "bg-red-500" : user.is_logged_in ? "bg-emerald-500" : "bg-slate-400"}`} />{user.banned ? "Blocked" : user.is_logged_in ? "Logged in" : "Offline"}</span></td><td className="px-4 py-3 text-right"><UserAccessButton blocked={user.banned} userId={user.id} userName={user.name} /></td></tr>)}</tbody>
            </table>
          </div>
          {!users.length ? <p className="p-8 text-center text-sm text-muted-foreground">No registered users found.</p> : null}
        </section>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof UsersRound; label: string; value: number; tone?: "online" }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className={`grid h-9 w-9 place-items-center rounded-xl ${tone === "online" ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}><Icon aria-hidden size={18} /></div><p className="mt-3 text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}
