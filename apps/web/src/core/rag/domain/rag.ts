import { z } from "zod";

export const ragQuerySchema = z.object({
  question: z.string().min(1).max(4000),
  chapterSlug: z.string().optional(),
  lessonSlug: z.string().optional(),
  tags: z.array(z.string()).default([]),
  difficulty: z.string().optional(),
  topK: z.number().int().min(1).max(20).optional(),
  scoreThreshold: z.number().min(0).max(1).optional(),
});

export const ragSearchSchema = z.object({
  query: z.string().max(1000).default(""),
  chapterSlug: z.string().optional(),
  tags: z.array(z.string()).default([]),
  difficulty: z.string().optional(),
  topK: z.number().int().min(1).max(50).default(10),
  semantic: z.boolean().default(true),
});

