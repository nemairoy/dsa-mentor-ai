import { z } from "zod";

export const animationSpeedSchema = z.union([
  z.literal(0.25),
  z.literal(0.5),
  z.literal(1),
  z.literal(2),
  z.literal(4),
]);

export const visualNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string().optional(),
  x: z.number(),
  y: z.number(),
  state: z.enum(["default", "active", "visited", "found", "compare", "swap", "muted"]).default("default"),
});

export const visualEdgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  state: z.enum(["default", "active", "visited", "muted"]).default("default"),
  directed: z.boolean().default(false),
});

export const animationStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  explanation: z.string(),
  durationMs: z.number().int().positive(),
  state: z.object({
    nodes: z.array(visualNodeSchema).default([]),
    edges: z.array(visualEdgeSchema).default([]),
    collections: z.record(z.string(), z.array(z.string())).default({}),
  }),
  highlightedElements: z.array(z.string()).default([]),
  variables: z.record(z.string(), z.string()).default({}),
  pseudocodeLine: z.number().int().positive(),
  codeLine: z.number().int().positive(),
});

export const animationDefinitionSchema = z.object({
  id: z.string(),
  componentName: z.string(),
  title: z.string(),
  category: z.string(),
  description: z.string(),
  defaultSpeed: animationSpeedSchema.default(1),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  pseudocode: z.array(z.string()).min(1),
  code: z.object({
    language: z.enum(["python", "java", "javascript", "c"]).default("python"),
    lines: z.array(z.string()).min(1),
  }),
  steps: z.array(animationStepSchema).min(1),
  metadata: z.object({
    lessonIds: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    difficulty: z.string().default("Beginner"),
    aiTriggers: z.array(z.string()).default([]),
  }),
});

export type AnimationSpeed = z.infer<typeof animationSpeedSchema>;
export type VisualNode = z.infer<typeof visualNodeSchema>;
export type VisualEdge = z.infer<typeof visualEdgeSchema>;
export type AnimationStep = z.infer<typeof animationStepSchema>;
export type AnimationDefinition = z.infer<typeof animationDefinitionSchema>;

