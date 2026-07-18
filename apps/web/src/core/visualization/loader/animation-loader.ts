import { animationRegistry } from "@/core/visualization/registry/animation-registry";

export class AnimationLoader {
  load(id: string) {
    return animationRegistry.get(id) ?? animationRegistry.getFromAnimationMap(id);
  }
}

export const animationLoader = new AnimationLoader();

