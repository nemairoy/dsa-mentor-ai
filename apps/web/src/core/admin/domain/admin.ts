import { z } from "zod";

export const adminRoleSchema = z.enum([
  "student",
  "content_creator",
  "reviewer",
  "administrator",
  "super_administrator",
]);

export const contentDraftSchema = z.object({
  contentType: z.enum(["chapter", "lesson", "practice", "animation"]),
  chapterSlug: z.string().optional(),
  lessonSlug: z.string().optional(),
  title: z.string().min(1),
  markdown: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  status: z.enum(["draft", "review", "published", "archived"]).default("draft"),
});

export const aiAuthoringSchema = z.object({
  feature: z.enum([
    "lesson_draft",
    "improve_explanation",
    "examples",
    "code",
    "practice_problems",
    "interview_questions",
    "revision_notes",
    "flashcards",
    "quiz",
    "learning_objectives",
    "metadata_suggestions",
  ]),
  prompt: z.string().min(1).max(12000),
});

export type AdminRole = z.infer<typeof adminRoleSchema>;
export type ContentDraftInput = z.infer<typeof contentDraftSchema>;
export type AiAuthoringInput = z.infer<typeof aiAuthoringSchema>;

export type AdminPrincipal = {
  userId: string;
  role: AdminRole;
  permissions: string[];
  rank: number;
};

export type AdminOverview = {
  users: number;
  chapters: number;
  lessons: number;
  practiceProblems: number;
  animations: number;
  aiUsage: number;
  drafts: number;
  ragChunks: number;
  indexedLessons: number;
  recentActivity: Array<{ action: string; entityType: string; createdAt: Date }>;
};

