"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error boundary", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="max-w-md rounded-lg border border-border bg-card p-4">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">The app recovered safely. Try again or return to the dashboard.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={reset}>Try again</Button>
          <Button asChild type="button" variant="outline"><Link href="/">Back to home</Link></Button>
        </div>
      </section>
    </main>
  );
}
