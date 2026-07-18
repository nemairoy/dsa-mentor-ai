export type AnimationTheme = {
  background: string;
  node: string;
  active: string;
  visited: string;
  found: string;
  compare: string;
  swap: string;
  muted: string;
  edge: string;
  text: string;
};

export const lightAnimationTheme: AnimationTheme = {
  background: "#f8fafc",
  node: "#ffffff",
  active: "#2563eb",
  visited: "#16a34a",
  found: "#15803d",
  compare: "#f59e0b",
  swap: "#dc2626",
  muted: "#cbd5e1",
  edge: "#64748b",
  text: "#0f172a",
};

export const darkAnimationTheme: AnimationTheme = {
  background: "#020617",
  node: "#0f172a",
  active: "#60a5fa",
  visited: "#4ade80",
  found: "#22c55e",
  compare: "#fbbf24",
  swap: "#f87171",
  muted: "#334155",
  edge: "#94a3b8",
  text: "#f8fafc",
};

export function colorForState(theme: AnimationTheme, state: string) {
  if (state === "active") return theme.active;
  if (state === "visited") return theme.visited;
  if (state === "found") return theme.found;
  if (state === "compare") return theme.compare;
  if (state === "swap") return theme.swap;
  if (state === "muted") return theme.muted;
  return theme.node;
}

