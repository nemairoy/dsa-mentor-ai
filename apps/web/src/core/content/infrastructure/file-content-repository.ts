import { promises as fs } from "fs";
import path from "path";

import {
  chapterMetadataSchema,
  roadmapSchema,
  type ChapterMetadata,
  type ChapterSummary,
  type ContentRepository,
  type Lesson,
  type Roadmap,
} from "@/core/content/domain/content";
import { logger } from "@/infrastructure/logging/logger";

const contentRoot = path.resolve(process.cwd(), "..", "..", "content");

export class FileContentRepository implements ContentRepository {
  private roadmapCache: Promise<ChapterSummary[]> | null = null;
  private rawRoadmapCache: Promise<Roadmap> | null = null;
  private metadataCache = new Map<string, Promise<ChapterMetadata>>();
  private markdownCache = new Map<string, Promise<string>>();
  private flatLessonCache: Promise<Array<{ chapter: ChapterSummary; lesson: ChapterSummary["lessons"][number] }>> | null = null;

  async getRoadmap(): Promise<ChapterSummary[]> {
    this.roadmapCache ??= this.buildRoadmap();
    return this.roadmapCache;
  }

  private async buildRoadmap(): Promise<ChapterSummary[]> {
    const roadmap = await this.readRoadmap();

    const chapters = await Promise.all(
      roadmap.chapters
        .toSorted((left, right) => left.order - right.order)
        .map(async (chapterRef) => {
          const metadata = await this.readChapterMetadata(chapterRef.slug);

          const lessons = chapterRef.lessons
            .toSorted((left, right) => left.order - right.order)
            .map((lessonRef) => {
              const lessonMetadata = metadata.lessons[lessonRef.slug];

              if (!lessonMetadata) {
                throw new Error(`Missing metadata for ${chapterRef.slug}/${lessonRef.slug}`);
              }

              return {
                lessonId: lessonMetadata.lessonId ?? `${chapterRef.slug}.${lessonRef.slug}`,
                slug: lessonRef.slug,
                chapter: lessonMetadata.chapter ?? metadata.title,
                title: lessonMetadata.title,
                summary: lessonMetadata.summary,
                difficulty: lessonMetadata.difficulty ?? metadata.difficulty,
                estimatedTimeMinutes: lessonMetadata.estimatedTimeMinutes ?? lessonMetadata.durationMinutes,
                durationMinutes: lessonMetadata.durationMinutes,
                tags: lessonMetadata.tags ?? metadata.tags ?? [],
                prerequisites: lessonMetadata.prerequisites ?? ["Complete the previous lesson in this roadmap."],
                learningObjectives: lessonMetadata.learningObjectives ?? [
                  `Explain the purpose of ${lessonMetadata.title}.`,
                  "Identify the main operation pattern.",
                  "Reason about the basic time and space costs.",
                ],
                animationId: lessonMetadata.animationId ?? `${chapterRef.slug}-${lessonRef.slug}`,
                animationComponent: lessonMetadata.animationComponent ?? "FutureLessonAnimation",
                aiContext: lessonMetadata.aiContext ?? `${metadata.title}: ${lessonMetadata.title}`,
                aiSummary: lessonMetadata.aiSummary ?? lessonMetadata.summary,
                aiPromptContext:
                  lessonMetadata.aiPromptContext ?? `Teach ${lessonMetadata.title} in the ${metadata.title} chapter.`,
                ragMetadata: lessonMetadata.ragMetadata ?? {},
                embeddingMetadata: lessonMetadata.embeddingMetadata ?? {},
                timeComplexity: lessonMetadata.timeComplexity ?? "Depends on the operation and input size.",
                spaceComplexity: lessonMetadata.spaceComplexity ?? "Usually O(1) auxiliary space unless extra storage is used.",
                commonMistakes: lessonMetadata.commonMistakes ?? [
                  "Skipping edge cases such as empty input.",
                  "Confusing index positions with values.",
                  "Stating complexity without explaining the dominant operation.",
                ],
                interviewTips: lessonMetadata.interviewTips ?? [
                  "Clarify constraints before choosing an approach.",
                  "Discuss tradeoffs before coding.",
                  "Walk through a small example after implementation.",
                ],
                relatedLessons: lessonMetadata.relatedLessons ?? [],
                futureQuizId: lessonMetadata.futureQuizId ?? `quiz-${chapterRef.slug}-${lessonRef.slug}`,
                futureFlashcardId: lessonMetadata.futureFlashcardId ?? `flashcards-${chapterRef.slug}-${lessonRef.slug}`,
                futureProjectId: lessonMetadata.futureProjectId ?? `project-${chapterRef.slug}-${lessonRef.slug}`,
                images: lessonMetadata.images ?? [],
                codeExamples: lessonMetadata.codeExamples ?? [
                  {
                    language: "python",
                    filename: `${lessonRef.slug}.py`,
                    code: `def solve(items):\n    \"\"\"Adapt this scaffold to the lesson operation.\"\"\"\n    for index, value in enumerate(items):\n        print(index, value)\n\n\nsolve([1, 2, 3])`,
                  },
                ],
                practiceProblems: lessonMetadata.practiceProblems ?? [
                  "Trace the operation on a small input by hand.",
                  "Write the simplest working implementation.",
                  "Explain the time and space complexity.",
                ],
                order: lessonRef.order,
                href: `/learn/${chapterRef.slug}/${lessonRef.slug}`,
              };
            });

          return {
            chapterId: metadata.chapterId ?? chapterRef.slug,
            slug: chapterRef.slug,
            title: metadata.title,
            description: metadata.description,
            difficulty: metadata.difficulty,
            estimatedHours: metadata.estimatedHours,
            tags: metadata.tags ?? [],
            animationNamespace: metadata.animationNamespace ?? metadata.title.replaceAll(" ", ""),
            aiContext: metadata.aiContext ?? metadata.description,
            order: chapterRef.order,
            lessons,
          };
        }),
    );

    return chapters;
  }

  async getLesson(chapterSlug: string, lessonSlug: string): Promise<Lesson | null> {
    try {
      const flatLessons = await this.getFlatLessons();
      const currentIndex = flatLessons.findIndex(
        (item) => item.chapter.slug === chapterSlug && item.lesson.slug === lessonSlug,
      );

      if (currentIndex === -1) {
        return null;
      }

      const current = flatLessons[currentIndex];
      const markdown = await this.readLessonMarkdown(chapterSlug, lessonSlug);

      return {
        chapter: current.chapter,
        lesson: current.lesson,
        markdown,
        previousLesson: flatLessons[currentIndex - 1]?.lesson ?? null,
        nextLesson: flatLessons[currentIndex + 1]?.lesson ?? null,
      };
    } catch (error) {
      logger.error("Failed to load lesson content", { chapterSlug, lessonSlug, error });
      return null;
    }
  }

  private async readRoadmap(): Promise<Roadmap> {
    this.rawRoadmapCache ??= this.loadRoadmap();
    return this.rawRoadmapCache;
  }

  private async loadRoadmap(): Promise<Roadmap> {
    const rawRoadmap = await fs.readFile(path.join(contentRoot, "roadmap.json"), "utf-8");
    return roadmapSchema.parse(JSON.parse(rawRoadmap));
  }

  private async readChapterMetadata(chapterSlug: string): Promise<ChapterMetadata> {
    if (!this.metadataCache.has(chapterSlug)) {
      this.metadataCache.set(chapterSlug, this.loadChapterMetadata(chapterSlug));
    }
    return this.metadataCache.get(chapterSlug)!;
  }

  private async loadChapterMetadata(chapterSlug: string): Promise<ChapterMetadata> {
    const rawMetadata = await fs.readFile(path.join(contentRoot, chapterSlug, "metadata.json"), "utf-8");
    return chapterMetadataSchema.parse(JSON.parse(rawMetadata));
  }

  private async getFlatLessons() {
    this.flatLessonCache ??= this.getRoadmap().then((roadmap) =>
      roadmap.flatMap((chapter) =>
        chapter.lessons.map((lesson) => ({
          chapter,
          lesson,
        })),
      ),
    );
    return this.flatLessonCache;
  }

  private async readLessonMarkdown(chapterSlug: string, lessonSlug: string) {
    const key = `${chapterSlug}/${lessonSlug}`;
    if (!this.markdownCache.has(key)) {
      this.markdownCache.set(key, fs.readFile(path.join(contentRoot, chapterSlug, `${lessonSlug}.md`), "utf-8"));
    }
    return this.markdownCache.get(key)!;
  }
}
