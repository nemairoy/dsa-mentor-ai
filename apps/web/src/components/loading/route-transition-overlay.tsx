"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { PageLoader } from "@/components/loading/page-loader";
import { routeTransitionStartEvent } from "@/components/loading/route-transition";

function shouldHandleLinkClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return false;

  const url = new URL(anchor.href, window.location.href);
  const current = new URL(window.location.href);
  if (url.origin !== current.origin) return false;

  return url.pathname !== current.pathname || url.search !== current.search;
}

export function RouteTransitionOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const delayRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  function showPending() {
    if (delayRef.current) window.clearTimeout(delayRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    // Fast prefetched navigations should feel instant instead of flashing a
    // full-screen loader. Slow transitions still receive clear feedback.
    delayRef.current = window.setTimeout(() => {
      setPending(true);
      delayRef.current = null;
    }, 180);
    timeoutRef.current = window.setTimeout(() => {
      setPending(false);
      timeoutRef.current = null;
    }, 10_000);
  }

  useEffect(() => {
    window.queueMicrotask(() => setPending(false));
    if (delayRef.current) {
      window.clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!shouldHandleLinkClick(event)) return;
      showPending();
    }

    function onProgrammaticTransition() {
      showPending();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener(routeTransitionStartEvent, onProgrammaticTransition);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(routeTransitionStartEvent, onProgrammaticTransition);
      if (delayRef.current) window.clearTimeout(delayRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/72 px-4 backdrop-blur-sm">
      <PageLoader compact />
    </div>
  );
}
