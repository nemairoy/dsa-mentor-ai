import { z } from "zod";

export const lessonRefSchema = z.object({
  slug: z.string().min(1),
  order: z.number().int().positive(),
});

export const chapterRefSchema = z.object({
  slug: z.string().min(1),
  order: z.number().int().positive(),
  lessons: z.array(lessonRefSchema).min(1),
});

export const roadmapSchema = z.object({
  version: z.number().int().positive(),
  chapters: z.array(chapterRefSchema).min(1),
});

export const lessonMetadataSchema = z.object({
  lessonId: z.string().min(1).optional(),
  chapter: z.string().min(1).optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
  difficulty: z.string().min(1).optional(),
  estimatedTimeMinutes: z.number().int().positive().optional(),
  durationMinutes: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
  animationId: z.string().min(1).optional(),
  animationComponent: z.string().min(1).optional(),
  aiContext: z.string().min(1).optional(),
  aiSummary: z.string().min(1).optional(),
  aiPromptContext: z.string().min(1).optional(),
  ragMetadata: z.record(z.string(), z.unknown()).optional(),
  embeddingMetadata: z.record(z.string(), z.unknown()).optional(),
  timeComplexity: z.string().optional(),
  spaceComplexity: z.string().optional(),
  commonMistakes: z.array(z.string()).optional(),
  interviewTips: z.array(z.string()).optional(),
  relatedLessons: z.array(z.string()).optional(),
  futureQuizId: z.string().min(1).optional(),
  futureFlashcardId: z.string().min(1).optional(),
  futureProjectId: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
  codeExamples: z
    .array(
      z.object({
        language: z.string().min(1),
        filename: z.string().min(1),
        code: z.string().min(1),
      }),
    )
    .optional(),
  practiceProblems: z.array(z.string()).optional(),
}).passthrough();

export const chapterMetadataSchema = z.object({
  chapterId: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.string().min(1),
  estimatedHours: z.number().positive(),
  tags: z.array(z.string()).optional(),
  animationNamespace: z.string().min(1).optional(),
  aiContext: z.string().min(1).optional(),
  lessons: z.record(z.string(), lessonMetadataSchema),
}).passthrough();

export type Roadmap = z.infer<typeof roadmapSchema>;
export type ChapterMetadata = z.infer<typeof chapterMetadataSchema>;

export type LessonSummary = {
  lessonId: string;
  slug: string;
  chapter: string;
  title: string;
  summary: string;
  difficulty: string;
  estimatedTimeMinutes: number;
  durationMinutes: number;
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  animationId: string;
  animationComponent: string;
  aiContext: string;
  aiSummary: string;
  aiPromptContext: string;
  ragMetadata: Record<string, unknown>;
  embeddingMetadata: Record<string, unknown>;
  timeComplexity: string;
  spaceComplexity: string;
  commonMistakes: string[];
  interviewTips: string[];
  relatedLessons: string[];
  futureQuizId: string;
  futureFlashcardId: string;
  futureProjectId: string;
  images: string[];
  codeExamples: Array<{
    language: string;
    filename: string;
    code: string;
  }>;
  practiceProblems: string[];
  order: number;
  href: string;
};

export type ChapterSummary = {
  chapterId: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  tags: string[];
  animationNamespace: string;
  aiContext: string;
  order: number;
  lessons: LessonSummary[];
};

export type Lesson = {
  chapter: ChapterSummary;
  lesson: LessonSummary;
  markdown: string;
  previousLesson: LessonSummary | null;
  nextLesson: LessonSummary | null;
};

export interface ContentRepository {
  getRoadmap(): Promise<ChapterSummary[]>;
  getLesson(chapterSlug: string, lessonSlug: string): Promise<Lesson | null>;
}
