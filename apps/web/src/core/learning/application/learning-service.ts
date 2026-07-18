import {
  lessonIdentitySchema,
  noteInputSchema,
  progressInputSchema,
  type BookmarkRepository,
  type LessonIdentity,
  type NotesRepository,
  type ProgressInput,
  type ProgressRepository,
  type NoteInput,
} from "@/core/learning/domain/learning";

export class LearningService {
  constructor(
    private readonly bookmarks: BookmarkRepository,
    private readonly progress: ProgressRepository,
    private readonly notes: NotesRepository,
  ) {}

  listBookmarks(userId: string) {
    return this.bookmarks.list(userId);
  }

  isBookmarked(userId: string, lesson: LessonIdentity) {
    return this.bookmarks.isBookmarked(userId, lessonIdentitySchema.parse(lesson));
  }

  async setBookmark(userId: string, lesson: LessonIdentity, bookmarked: boolean) {
    const validatedLesson = lessonIdentitySchema.parse(lesson);

    if (bookmarked) {
      await this.bookmarks.add(userId, validatedLesson);
      return;
    }

    await this.bookmarks.remove(userId, validatedLesson);
  }

  getProgress(userId: string, lesson: LessonIdentity) {
    return this.progress.get(userId, lessonIdentitySchema.parse(lesson));
  }

  updateProgress(userId: string, input: ProgressInput) {
    return this.progress.update(userId, progressInputSchema.parse(input));
  }

  getNote(userId: string, lesson: LessonIdentity) {
    return this.notes.get(userId, lessonIdentitySchema.parse(lesson));
  }

  saveNote(userId: string, input: NoteInput) {
    return this.notes.save(userId, noteInputSchema.parse(input));
  }
}

