import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { OwnerAdminLoginForm } from "@/components/admin/owner-admin-login-form";
import { BrandLockup } from "@/components/brand/brand-logo";
import { hasOwnerAdminSession } from "@/lib/owner-admin-auth";

export const metadata: Metadata = {
  title: "Owner admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await hasOwnerAdminSession()) redirect("/admin-console");

  return (
    <main className="dark relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-8 text-foreground [color-scheme:dark]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.15),transparent_35%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-border bg-card/95 p-6 shadow-2xl sm:p-8">
        <BrandLockup />
        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300"><ShieldCheck aria-hidden size={14} />Owner access</div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Admin console</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Securely review registered users and their current session status.</p>
        <OwnerAdminLoginForm />
        <Link href="/sign-in" className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft aria-hidden size={14} />Back to learner sign in</Link>
      </section>
    </main>
  );
}
