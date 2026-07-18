import type { AnimationDefinition, AnimationStep } from "@/core/visualization/schema/animation-schema";

export class AnimationEngine {
  constructor(private readonly definition: AnimationDefinition) {}

  get totalSteps() {
    return this.definition.steps.length;
  }

  getStep(index: number): AnimationStep {
    const boundedIndex = Math.min(Math.max(index, 0), this.definition.steps.length - 1);
    return this.definition.steps[boundedIndex];
  }

  getProgress(index: number): number {
    if (this.definition.steps.length <= 1) {
      return 100;
    }

    return Math.round((index / (this.definition.steps.length - 1)) * 100);
  }

  getDuration(index: number, speed: number): number {
    return this.getStep(index).durationMs / speed;
  }
}

