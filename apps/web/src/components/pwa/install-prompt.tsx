"use client";

import Image from "next/image";
import { Download, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const DISMISSED_AT_KEY = "dsa-mentor-ai-install-prompt-dismissed-at";
const DISMISS_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isInstalled() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function wasRecentlyDismissed() {
  try {
    const dismissedAt = Number(window.localStorage.getItem(DISMISSED_AT_KEY));
    return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
  } catch {
    // Installation remains usable when storage is unavailable (for example, private browsing).
  }
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (isInstalled() || wasRecentlyDismissed()) return;

    const iosPromptTimer = isIosDevice() ? window.setTimeout(() => setShowIosPrompt(true), 0) : undefined;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallEvent(null);
      setShowIosPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      if (iosPromptTimer !== undefined) window.clearTimeout(iosPromptTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    rememberDismissal();
    setInstallEvent(null);
    setShowIosPrompt(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "dismissed") {
      rememberDismissal();
    }
  };

  if (!installEvent && !showIosPrompt) return null;

  return (
    <aside
      aria-label="Install DSA Mentor AI"
      aria-live="polite"
      className="fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-[90] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-border bg-card/95 p-3 text-card-foreground shadow-2xl backdrop-blur-xl sm:p-4"
    >
      <div className="flex items-start gap-3">
        <Image src="/icons/icon-192.png" width={44} height={44} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-border bg-white" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install DSA Mentor AI</p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">Add it to your home screen for quick, app-like access.</p>
          {showIosSteps ? (
            <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs leading-5">
              In Safari, tap <Share2 className="mx-1 inline-block" aria-hidden size={14} /> <strong>Share</strong>, then choose <strong>Add to Home Screen</strong> and tap <strong>Add</strong>.
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {installEvent ? (
              <Button type="button" size="sm" onClick={() => void install()}><Download aria-hidden size={14} /> Install</Button>
            ) : (
              <Button type="button" size="sm" onClick={() => setShowIosSteps(true)} disabled={showIosSteps}>
                <Share2 aria-hidden size={14} /> {showIosSteps ? "Follow the steps above" : "How to install"}
              </Button>
            )}
            <Button type="button" size="sm" variant="ghost" onClick={dismiss}>Not now</Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dismiss install suggestion"
        >
          <X aria-hidden size={18} />
        </button>
      </div>
    </aside>
  );
}
