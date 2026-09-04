"use client";

import { KeyRound, LoaderCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function OwnerAdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/owner-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json() as { detail?: string };
      if (!response.ok) {
        setError(payload.detail ?? "Admin sign-in failed.");
        return;
      }
      router.replace("/admin-console");
      router.refresh();
    } catch {
      setError("The sign-in service could not be reached. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium">
        Admin email
        <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
      </label>
      {error ? <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <LoaderCircle aria-hidden className="animate-spin" size={17} /> : <LogIn aria-hidden size={17} />}
        {loading ? "Signing in..." : "Open admin console"}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><KeyRound aria-hidden size={13} />Restricted to the project owner</p>
    </form>
  );
}
