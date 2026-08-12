"use client";

import { Clock3, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  clearSessionActivity,
  markSessionActivity,
  sessionActivityStorageKey,
} from "@/lib/session-activity";

const idleTimeoutMs = 30 * 60 * 1_000;
const warningDurationMs = 60 * 1_000;
const activityWriteThrottleMs = 5 * 1_000;

export function IdleSessionGuard() {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const lastActivityRef = useRef(0);
  const lastWriteRef = useRef(0);
  const signingOutRef = useRef(false);

  const signOutForInactivity = useCallback(async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    clearSessionActivity();

    try {
      await authClient.signOut();
    } finally {
      router.replace("/sign-in?reason=inactive");
      router.refresh();
    }
  }, [router]);

  const recordActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setSecondsRemaining(null);

    if (now - lastWriteRef.current >= activityWriteThrottleMs) {
      lastWriteRef.current = now;
      markSessionActivity();
    }
  }, []);

  useEffect(() => {
    const storedActivity = Number(window.localStorage.getItem(sessionActivityStorageKey));
    const now = Date.now();
    lastActivityRef.current = Number.isFinite(storedActivity) && storedActivity > 0 ? storedActivity : now;

    if (!storedActivity) {
      markSessionActivity();
      lastWriteRef.current = now;
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
      "focus",
    ];
    function handleUserActivity(event: Event) {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-idle-session-dialog]")) return;
      recordActivity();
    }

    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, handleUserActivity, { passive: true }),
    );

    function syncActivity(event: StorageEvent) {
      if (event.key !== sessionActivityStorageKey) return;
      if (!event.newValue) {
        void signOutForInactivity();
        return;
      }
      const timestamp = Number(event.newValue);
      if (Number.isFinite(timestamp)) {
        lastActivityRef.current = timestamp;
        setSecondsRemaining(null);
      }
    }

    window.addEventListener("storage", syncActivity);

    const timer = window.setInterval(() => {
      const remaining = idleTimeoutMs - (Date.now() - lastActivityRef.current);

      if (remaining <= 0) {
        void signOutForInactivity();
        return;
      }

      setSecondsRemaining(
        remaining <= warningDurationMs ? Math.max(1, Math.ceil(remaining / 1_000)) : null,
      );
    }, 1_000);

    return () => {
      window.clearInterval(timer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, handleUserActivity));
      window.removeEventListener("storage", syncActivity);
    };
  }, [recordActivity, signOutForInactivity]);

  if (secondsRemaining === null) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center" role="alertdialog" aria-modal="true" aria-labelledby="idle-session-title">
      <section data-idle-session-dialog className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-foreground shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
            <Clock3 aria-hidden={true} size={20} />
          </span>
          <div>
            <h2 id="idle-session-title" className="font-semibold">Still learning?</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              You will be signed out in {secondsRemaining} seconds because there has been no activity.
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="min-h-11" onClick={() => void signOutForInactivity()}>
            <LogOut aria-hidden={true} size={16} />
            Sign out
          </Button>
          <Button type="button" className="min-h-11" onClick={recordActivity} autoFocus>
            Stay signed in
          </Button>
        </div>
      </section>
    </div>
  );
}
