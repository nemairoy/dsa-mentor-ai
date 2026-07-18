"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProtectedError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300">
        <AlertTriangle aria-hidden={true} size={24} />
      </div>
      <h1 className="mt-3 text-lg font-semibold">Something interrupted this page</h1>
      <p className="mx-auto mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground">
        The app state is still safe. Try reloading this screen, then continue from the sidebar if the issue persists.
      </p>
      {error.digest ? <p className="mt-3 text-xs text-muted-foreground">Error reference: {error.digest}</p> : null}
      <Button type="button" onClick={reset} className="mt-5">
        Try again
      </Button>
    </section>
  );
}
