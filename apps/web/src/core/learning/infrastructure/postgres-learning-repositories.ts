import type { QueryResultRow } from "pg";

import {
  type Bookmark,
  type BookmarkRepository,
  type LessonIdentity,
  type LessonNote,
  type NoteInput,
  type NotesRepository,
  type ProgressInput,
  type ProgressRepository,
  type ReadingProgress,
} from "@/core/learning/domain/learning";
import { pool } from "@/infrastructure/database/postgres";

function mapBookmark(row: QueryResultRow): Bookmark {
  return {
    id: row.id,
    chapterSlug: row.chapter_slug,
    lessonSlug: row.lesson_slug,
    createdAt: row.created_at,
  };
}

function mapProgress(row: QueryResultRow): ReadingProgress {
  return {
    chapterSlug: row.chapter_slug,
    lessonSlug: row.lesson_slug,
    status: row.status,
    progressPercent: row.progress_percent,
    currentLesson: row.current_lesson,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    lastReadAt: row.last_read_at,
  };
}

function mapNote(row: QueryResultRow): LessonNote {
  return {
    chapterSlug: row.chapter_slug,
    lessonSlug: row.lesson_slug,
    body: row.body,
    updatedAt: row.updated_at,
  };
}

export class PostgresBookmarkRepository implements BookmarkRepository {
  async list(userId: string): Promise<Bookmark[]> {
    const result = await pool.query(
      `SELECT id, chapter_slug, lesson_slug, created_at
       FROM lesson_bookmarks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    return result.rows.map(mapBookmark);
  }

  async isBookmarked(userId: string, lesson: LessonIdentity): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM lesson_bookmarks
       WHERE user_id = $1 AND chapter_slug = $2 AND lesson_slug = $3
       LIMIT 1`,
      [userId, lesson.chapterSlug, lesson.lessonSlug],
    );

    return Boolean(result.rowCount);
  }

  async add(userId: string, lesson: LessonIdentity): Promise<void> {
    await pool.query(
      `INSERT INTO lesson_bookmarks (user_id, chapter_slug, lesson_slug)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, chapter_slug, lesson_slug) DO NOTHING`,
      [userId, lesson.chapterSlug, lesson.lessonSlug],
    );
  }

  async remove(userId: string, lesson: LessonIdentity): Promise<void> {
    await pool.query(
      `DELETE FROM lesson_bookmarks
       WHERE user_id = $1 AND chapter_slug = $2 AND lesson_slug = $3`,
      [userId, lesson.chapterSlug, lesson.lessonSlug],
    );
  }
}

export class PostgresProgressRepository implements ProgressRepository {
  async get(userId: string, lesson: LessonIdentity): Promise<ReadingProgress | null> {
    const result = await pool.query(
      `SELECT chapter_slug, lesson_slug, status, progress_percent, current_lesson, started_at, completed_at, last_read_at
       FROM lesson_progress
       WHERE user_id = $1 AND chapter_slug = $2 AND lesson_slug = $3
       LIMIT 1`,
      [userId, lesson.chapterSlug, lesson.lessonSlug],
    );

    return result.rows[0] ? mapProgress(result.rows[0]) : null;
  }

  async update(userId: string, input: ProgressInput): Promise<ReadingProgress> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [userId]);
      await client.query(
        `UPDATE lesson_progress
         SET current_lesson = FALSE
         WHERE user_id = $1
         AND current_lesson = TRUE
         AND NOT (chapter_slug = $2 AND lesson_slug = $3)`,
        [userId, input.chapterSlug, input.lessonSlug],
      );

      const result = await client.query(
        `INSERT INTO lesson_progress (
          user_id, chapter_slug, lesson_slug, status, progress_percent, current_lesson, started_at, completed_at, last_read_at
        )
        VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), CASE WHEN $4 = 'completed' THEN NOW() ELSE NULL END, NOW())
        ON CONFLICT (user_id, chapter_slug, lesson_slug)
        DO UPDATE SET
          status = EXCLUDED.status,
          progress_percent = GREATEST(lesson_progress.progress_percent, EXCLUDED.progress_percent),
          current_lesson = TRUE,
          started_at = COALESCE(lesson_progress.started_at, NOW()),
          completed_at = CASE WHEN EXCLUDED.status = 'completed' THEN NOW() ELSE lesson_progress.completed_at END,
          last_read_at = NOW()
        RETURNING chapter_slug, lesson_slug, status, progress_percent, current_lesson, started_at, completed_at, last_read_at`,
        [userId, input.chapterSlug, input.lessonSlug, input.status, input.progressPercent],
      );

      await client.query("COMMIT");
      return mapProgress(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export class PostgresNotesRepository implements NotesRepository {
  async get(userId: string, lesson: LessonIdentity): Promise<LessonNote | null> {
    const result = await pool.query(
      `SELECT chapter_slug, lesson_slug, body, updated_at
       FROM lesson_notes
       WHERE user_id = $1 AND chapter_slug = $2 AND lesson_slug = $3
       LIMIT 1`,
      [userId, lesson.chapterSlug, lesson.lessonSlug],
    );

    return result.rows[0] ? mapNote(result.rows[0]) : null;
  }

  async save(userId: string, input: NoteInput): Promise<LessonNote> {
    const result = await pool.query(
      `INSERT INTO lesson_notes (user_id, chapter_slug, lesson_slug, body)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, chapter_slug, lesson_slug)
       DO UPDATE SET body = EXCLUDED.body
       RETURNING chapter_slug, lesson_slug, body, updated_at`,
      [userId, input.chapterSlug, input.lessonSlug, input.body],
    );

    return mapNote(result.rows[0]);
  }
}
