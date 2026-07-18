"use client";

import { useEffect, useSyncExternalStore } from "react";

export type AppTheme = "light" | "dark" | "system";

const storageKey = "dsa-mentor-ai-theme";
const listeners = new Set<() => void>();
let initialized = false;
let currentTheme: AppTheme = "system";

function isTheme(value: string | null): value is AppTheme {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: AppTheme) {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;
  const resolvedTheme = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
}

function emitThemeChange() {
  listeners.forEach((listener) => listener());
}

function initTheme() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const storedTheme = window.localStorage.getItem(storageKey);
  currentTheme = isTheme(storedTheme) ? storedTheme : "system";
  applyTheme(currentTheme);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (currentTheme === "system") {
      applyTheme(currentTheme);
      emitThemeChange();
    }
  });
}

function subscribe(listener: () => void) {
  initTheme();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getThemeSnapshot() {
  if (typeof window === "undefined") return "system";
  initTheme();
  return currentTheme;
}

function getServerThemeSnapshot() {
  return "system" as AppTheme;
}

export function setAppTheme(theme: AppTheme) {
  currentTheme = theme;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, theme);
  }
  applyTheme(theme);
  emitThemeChange();
}

export function useAppTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot);
  return {
    theme,
    resolvedTheme: resolveTheme(theme),
    setTheme: setAppTheme,
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTheme();
    applyTheme(currentTheme);
  }, []);

  return children;
}

