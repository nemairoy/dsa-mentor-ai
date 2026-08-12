export const sessionActivityStorageKey = "dsa-mentor-ai-last-activity";

export function markSessionActivity() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(sessionActivityStorageKey, String(Date.now()));
}

export function clearSessionActivity() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(sessionActivityStorageKey);
}
