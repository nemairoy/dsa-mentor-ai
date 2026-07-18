type AnimationEvent =
  | { type: "play" }
  | { type: "pause" }
  | { type: "reset" }
  | { type: "step"; index: number }
  | { type: "complete" };

type Listener = (event: AnimationEvent) => void;

export class AnimationEventSystem {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(event: AnimationEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

