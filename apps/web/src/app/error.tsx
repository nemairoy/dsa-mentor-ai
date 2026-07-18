"use client";

import { useEffect } from "react";

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
        <Button type="button" className="mt-4" onClick={reset}>
          Try again
        </Button>
      </section>
    </main>
  );
}
