import type { ChapterSummary, ContentRepository, Lesson } from "@/core/content/domain/content";

export class ContentService {
  constructor(private readonly contentRepository: ContentRepository) {}

  getRoadmap(): Promise<ChapterSummary[]> {
    return this.contentRepository.getRoadmap();
  }

  getLesson(chapterSlug: string, lessonSlug: string): Promise<Lesson | null> {
    return this.contentRepository.getLesson(chapterSlug, lessonSlug);
  }

  async getFirstLessonPath(): Promise<string | null> {
    const roadmap = await this.contentRepository.getRoadmap();
    return roadmap[0]?.lessons[0]?.href ?? null;
  }
}

