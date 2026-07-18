import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="max-w-md rounded-lg border border-border bg-card p-4">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The requested page does not exist or is unavailable.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </section>
    </main>
  );
}
