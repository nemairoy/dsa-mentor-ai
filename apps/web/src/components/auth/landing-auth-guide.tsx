"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Play, Zap } from "lucide-react";

const authCueEvent = "dsa-mentor-ai:show-auth-cue";

export function LandingPrimaryActions() {
  function showAuthCue() {
    window.dispatchEvent(new Event(authCueEvent));
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={showAuthCue}
        className="group flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:shadow-black/30 sm:text-sm"
      >
        <Play aria-hidden={true} size={14} />
        Start learning
        <ArrowRight aria-hidden={true} size={14} className="transition-transform group-hover:translate-x-0.5" />
      </button>
      <button
        type="button"
        onClick={showAuthCue}
        className="flex items-center gap-2 rounded-full border border-border bg-card/75 px-4 py-2 text-xs font-semibold text-foreground shadow-sm shadow-slate-200/60 backdrop-blur transition hover:-translate-y-0.5 hover:bg-muted dark:bg-white/7 dark:shadow-none sm:text-sm"
      >
        <Zap aria-hidden={true} size={14} className="text-amber-500" />
        Practice with AI
      </button>
    </div>
  );
}

export function SignInCallout({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onCue() {
      setActive(true);
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setActive(false), 4_500);
    }

    window.addEventListener(authCueEvent, onCue);
    return () => {
      window.removeEventListener(authCueEvent, onCue);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div ref={cardRef} className="space-y-3">
      <div className={active ? "auth-cue-ring rounded-2xl" : "rounded-2xl"}>{children}</div>
      {active ? (
        <div className="auth-cue-message rounded-2xl border border-emerald-400/40 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm dark:bg-emerald-400/10 dark:text-emerald-100">
          Continue with Google to open your workspace.
        </div>
      ) : null}
    </div>
  );
}
