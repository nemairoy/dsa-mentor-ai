import { animationDefinitionSchema, type AnimationDefinition } from "@/core/visualization/schema/animation-schema";

export class AnimationJsonParser {
  parse(input: unknown): AnimationDefinition {
    return animationDefinitionSchema.parse(input);
  }
}

