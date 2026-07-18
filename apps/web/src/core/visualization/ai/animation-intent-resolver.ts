import { animationRegistry } from "@/core/visualization/registry/animation-registry";

export class AnimationIntentResolver {
  resolve(query: string) {
    const normalized = query.toLowerCase();
    const entries = animationRegistry.list();

    return (
      entries.find((entry) => normalized.includes(entry.title.toLowerCase())) ??
      entries.find((entry) => normalized.includes(entry.category.toLowerCase())) ??
      null
    );
  }
}

export const animationIntentResolver = new AnimationIntentResolver();

