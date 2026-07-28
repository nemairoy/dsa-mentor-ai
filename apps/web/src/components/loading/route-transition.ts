export const routeTransitionStartEvent = "dsa-mentor-ai:route-transition-start";

export function announceRouteTransition() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(routeTransitionStartEvent));
}
