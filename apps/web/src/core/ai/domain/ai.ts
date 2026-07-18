import { z } from "zod";

export const aiFeatureSchema = z.enum([
  "explain_lesson",
  "explain_code",
  "line_by_line_code",
  "convert_code",
  "summary",
  "revision_notes",
  "flashcards",
  "interview_questions",
  "mcq_quiz",
  "coding_questions",
  "follow_up",
]);

export const supportedLanguageSchema = z.enum(["python", "java", "javascript", "c"]);

export const aiRequestSchema = z.object({
  feature: aiFeatureSchema,
  chapterSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
  lessonTitle: z.string().min(1),
  lessonMarkdown: z.string().min(1),
  question: z.string().max(4000).optional(),
  code: z.string().max(12000).optional(),
  sourceLanguage: supportedLanguageSchema.optional(),
  targetLanguage: supportedLanguageSchema.optional(),
});

export type AiRequest = z.infer<typeof aiRequestSchema>;
export type AiFeature = z.infer<typeof aiFeatureSchema>;

