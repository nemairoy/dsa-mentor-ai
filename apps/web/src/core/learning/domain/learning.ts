import { z } from "zod";

export const lessonIdentitySchema = z.object({
  chapterSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
});

export const progressInputSchema = lessonIdentitySchema.extend({
  progressPercent: z.number().int().min(0).max(100),
  status: z.enum(["started", "completed"]).default("started"),
});

export const noteInputSchema = lessonIdentitySchema.extend({
  body: z.string().max(20000),
});

export type LessonIdentity = z.infer<typeof lessonIdentitySchema>;
export type ProgressInput = z.infer<typeof progressInputSchema>;
export type NoteInput = z.infer<typeof noteInputSchema>;

export type Bookmark = LessonIdentity & {
  id: string;
  createdAt: Date;
};

export type ReadingProgress = LessonIdentity & {
  status: "not_started" | "started" | "completed";
  progressPercent: number;
  currentLesson: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
  lastReadAt: Date;
};

export type LessonNote = LessonIdentity & {
  body: string;
  updatedAt: Date;
};

export interface BookmarkRepository {
  list(userId: string): Promise<Bookmark[]>;
  isBookmarked(userId: string, lesson: LessonIdentity): Promise<boolean>;
  add(userId: string, lesson: LessonIdentity): Promise<void>;
  remove(userId: string, lesson: LessonIdentity): Promise<void>;
}

export interface ProgressRepository {
  get(userId: string, lesson: LessonIdentity): Promise<ReadingProgress | null>;
  update(userId: string, input: ProgressInput): Promise<ReadingProgress>;
}

export interface NotesRepository {
  get(userId: string, lesson: LessonIdentity): Promise<LessonNote | null>;
  save(userId: string, input: NoteInput): Promise<LessonNote>;
}

