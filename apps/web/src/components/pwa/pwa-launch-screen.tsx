"use client";

import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";

const LAUNCH_SEEN_KEY = "dsa-mentor-ai:pwa-launch-seen";

function isStandaloneApp() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export function PwaLaunchScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isStandaloneApp()) return;

    try {
      if (window.sessionStorage.getItem(LAUNCH_SEEN_KEY)) return;
      window.sessionStorage.setItem(LAUNCH_SEEN_KEY, "1");
    } catch {
      // Private browsing can block storage; the launch animation remains safe to show.
    }

    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const hideTimer = window.setTimeout(() => setVisible(false), 1050);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="pwa-launch-screen" role="status" aria-label="Opening DSA Mentor AI">
      <div className="pwa-launch-glow" />
      <div className="pwa-launch-mark"><BrandLogo size="md" /></div>
      <p className="pwa-launch-title">DSA Mentor AI</p>
      <p className="pwa-launch-subtitle">Learn / Build / Master</p>
      <span className="pwa-launch-loader" aria-hidden="true" />
    </div>
  );
}
