import type { QueryResultRow } from "pg";

import { pool } from "@/infrastructure/database/postgres";
import type {
  DailyActivity,
  IntelligenceSnapshot,
  PracticeAttemptInput,
  PracticeProblem,
  TopicMastery,
  VisualizationUsageInput,
} from "@/core/intelligence/domain/intelligence";

function numberValue(value: unknown): number {
  return Number(value ?? 0);
}

function normalizeTestCases(row: QueryResultRow) {
  const rawTestCases = Array.isArray(row.future_test_cases) ? row.future_test_cases : [];
  const validTestCases = rawTestCases
    .filter((testCase) => testCase && typeof testCase === "object")
    .map((testCase) => ({
      input: String(testCase.input ?? "input = []"),
      output: String(testCase.output ?? "[]"),
      explanation: String(testCase.explanation ?? "This sample checks the expected behavior for the given input."),
    }))
    .filter((testCase) => testCase.input.trim() && testCase.output.trim() && testCase.explanation.trim());

  if (validTestCases.length >= 2) {
    return validTestCases.slice(0, 2);
  }

  return [
    ...validTestCases,
    {
      input: "input = []",
      output: "[]",
      explanation: "This edge case verifies that the solution handles empty input safely.",
    },
    {
      input: "input = [1]",
      output: "[1]",
      explanation: "This single-item case verifies the smallest non-empty input.",
    },
  ].slice(0, 2);
}

function mapProblem(row: QueryResultRow): PracticeProblem {
  return {
    id: row.id,
    title: row.title,
    difficulty: row.difficulty,
    topic: row.topic,
    subtopic: row.subtopic,
    tags: row.tags ?? [],
    companyTags: row.company_tags ?? [],
    explanation: row.explanation,
    hints: row.hints ?? [],
    editorial: row.editorial_placeholder ?? "",
    solution: row.solution_placeholder ?? "",
    testCases: normalizeTestCases(row),
    judgeMetadata: row.future_judge_metadata ?? {},
    lessonId: row.lesson_id,
    chapterSlug: row.chapter_slug,
    lessonSlug: row.lesson_slug,
    solved: Boolean(row.solved),
  };
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export class PostgresIntelligenceRepository {
  async getSnapshot(userId: string, totalLessons: number): Promise<IntelligenceSnapshot> {
    const [result, currentStreak] = await Promise.all([
      pool.query(
      `SELECT
        (SELECT COUNT(*) FROM lesson_progress WHERE user_id = $1 AND status = 'completed') AS completed_lessons,
        (SELECT COUNT(*) FROM lesson_progress WHERE user_id = $1) AS started_lessons,
        (SELECT COUNT(*) FROM lesson_bookmarks WHERE user_id = $1) AS bookmarks,
        (SELECT COUNT(*) FROM lesson_notes WHERE user_id = $1 AND LENGTH(TRIM(body)) > 0) AS notes,
        (SELECT COUNT(*) FROM ai_chat_history WHERE user_id = $1) AS ai_conversations,
        (SELECT COUNT(*) FROM visualization_usage WHERE user_id = $1) AS visualizations,
        (SELECT COUNT(DISTINCT problem_id) FROM practice_attempts WHERE user_id = $1 AND status = 'solved') AS solved_problems,
        (SELECT COUNT(*) FROM practice_attempts WHERE user_id = $1) AS attempted_problems,
        (SELECT COUNT(DISTINCT DATE(last_read_at)) FROM lesson_progress WHERE user_id = $1) AS study_days,
        (SELECT COALESCE(SUM(time_spent_seconds), 0) FROM practice_attempts WHERE user_id = $1) AS practice_seconds`,
      [userId],
      ),
      this.getCurrentStreak(userId),
    ]);
    const row = result.rows[0];

    return {
      completedLessons: numberValue(row.completed_lessons),
      startedLessons: numberValue(row.started_lessons),
      totalLessons,
      bookmarks: numberValue(row.bookmarks),
      notes: numberValue(row.notes),
      aiConversations: numberValue(row.ai_conversations),
      visualizations: numberValue(row.visualizations),
      solvedProblems: numberValue(row.solved_problems),
      attemptedProblems: numberValue(row.attempted_problems),
      studyDays: numberValue(row.study_days),
      studyTimeMinutes: Math.round(numberValue(row.practice_seconds) / 60),
      currentStreak,
    };
  }

  async getTopicMastery(userId: string, chapterTotals: Array<{ slug: string; title: string; total: number }>): Promise<TopicMastery[]> {
    const result = await pool.query(
      `SELECT chapter_slug, COUNT(*) FILTER (WHERE status = 'completed') AS completed
       FROM lesson_progress
       WHERE user_id = $1
       GROUP BY chapter_slug`,
      [userId],
    );
    const completedBySlug = new Map(result.rows.map((row) => [row.chapter_slug, numberValue(row.completed)]));

    return chapterTotals.map((chapter) => {
      const completed = completedBySlug.get(chapter.slug) ?? 0;
      return {
        topic: chapter.title,
        completed,
        total: chapter.total,
        mastery: chapter.total ? Math.round((completed / chapter.total) * 100) : 0,
      };
    });
  }

  async getDailyActivity(userId: string, days: number): Promise<DailyActivity[]> {
    const result = await pool.query(
      `WITH activity AS (
          SELECT DATE(last_read_at) AS day, 'lessons' AS type, COUNT(*)::int AS total
          FROM lesson_progress
          WHERE user_id = $1 AND last_read_at >= CURRENT_DATE - ($2::int - 1)
          GROUP BY DATE(last_read_at)
        UNION ALL
          SELECT DATE(created_at) AS day, 'practice' AS type, COUNT(*)::int AS total
          FROM practice_attempts
          WHERE user_id = $1 AND created_at >= CURRENT_DATE - ($2::int - 1)
          GROUP BY DATE(created_at)
        UNION ALL
          SELECT DATE(updated_at) AS day, 'notes' AS type, COUNT(*)::int AS total
          FROM lesson_notes
          WHERE user_id = $1 AND updated_at >= CURRENT_DATE - ($2::int - 1) AND LENGTH(TRIM(body)) > 0
          GROUP BY DATE(updated_at)
        UNION ALL
          SELECT DATE(created_at) AS day, 'visualizations' AS type, COUNT(*)::int AS total
          FROM visualization_usage
          WHERE user_id = $1 AND created_at >= CURRENT_DATE - ($2::int - 1)
          GROUP BY DATE(created_at)
       )
       SELECT day, type, total
       FROM activity
       ORDER BY day`,
      [userId, days],
    );

    const byDate = new Map<string, DailyActivity>();
    const today = new Date();

    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);
      const key = isoDate(date);
      byDate.set(key, {
        date: key,
        label: dayLabel(date),
        lessons: 0,
        practice: 0,
        notes: 0,
        visualizations: 0,
        total: 0,
      });
    }

    for (const row of result.rows) {
      const key = isoDate(new Date(row.day));
      const activity = byDate.get(key);

      if (!activity) continue;

      const total = numberValue(row.total);
      if (row.type === "lessons") activity.lessons = total;
      if (row.type === "practice") activity.practice = total;
      if (row.type === "notes") activity.notes = total;
      if (row.type === "visualizations") activity.visualizations = total;
      activity.total += total;
    }

    return Array.from(byDate.values());
  }

  async listPracticeProblems(userId: string, filters: { chapterSlug?: string; lessonSlug?: string; difficulty?: string; status?: string }): Promise<PracticeProblem[]> {
    const clauses: string[] = [];
    const values: string[] = [userId];

    if (filters.chapterSlug) {
      values.push(filters.chapterSlug);
      clauses.push(`chapter_slug = $${values.length}`);
    }
    if (filters.lessonSlug) {
      values.push(filters.lessonSlug);
      clauses.push(`lesson_slug = $${values.length}`);
    }
    if (filters.difficulty) {
      values.push(filters.difficulty);
      clauses.push(`difficulty = $${values.length}`);
    }
    if (filters.status === "solved") {
      clauses.push(`EXISTS (
        SELECT 1 FROM practice_attempts pa
        WHERE pa.problem_id = practice_problems.id AND pa.user_id = $1 AND pa.status = 'solved'
      )`);
    }
    if (filters.status === "unsolved") {
      clauses.push(`NOT EXISTS (
        SELECT 1 FROM practice_attempts pa
        WHERE pa.problem_id = practice_problems.id AND pa.user_id = $1 AND pa.status = 'solved'
      )`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT id, title, difficulty, topic, subtopic, tags, company_tags, explanation, hints,
        editorial_placeholder, solution_placeholder, future_test_cases, future_judge_metadata,
        lesson_id, chapter_slug, lesson_slug,
        EXISTS (
          SELECT 1 FROM practice_attempts pa
          WHERE pa.problem_id = practice_problems.id AND pa.user_id = $1 AND pa.status = 'solved'
        ) AS solved
       FROM practice_problems
       ${where}
       ORDER BY topic, subtopic, difficulty
       LIMIT 100`,
      values,
    );

    return result.rows.map(mapProblem);
  }

  async getPracticeProblem(problemId: string): Promise<PracticeProblem | null> {
    const result = await pool.query(
      `SELECT id, title, difficulty, topic, subtopic, tags, company_tags, explanation, hints,
        editorial_placeholder, solution_placeholder, future_test_cases, future_judge_metadata,
        lesson_id, chapter_slug, lesson_slug
       FROM practice_problems
       WHERE id = $1
       LIMIT 1`,
      [problemId],
    );

    return result.rows[0] ? mapProblem(result.rows[0]) : null;
  }

  async recordPracticeAttempt(userId: string, input: PracticeAttemptInput): Promise<void> {
    await pool.query(
      `INSERT INTO practice_attempts (user_id, problem_id, status, time_spent_seconds, mistakes, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, input.problemId, input.status, input.timeSpentSeconds, input.mistakes, input.notes ?? null],
    );
  }

  async recordVisualizationUsage(userId: string, input: VisualizationUsageInput): Promise<void> {
    await pool.query(
      `INSERT INTO visualization_usage (user_id, animation_id, lesson_id, event, duration_seconds)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, input.animationId, input.lessonId ?? null, input.event, input.durationSeconds],
    );
  }

  async listAchievementDefinitions() {
    const result = await pool.query(
      `SELECT id, title, description, xp, badge FROM achievement_definitions ORDER BY xp`,
    );
    return result.rows;
  }

  async listEarnedAchievementIds(userId: string): Promise<Set<string>> {
    const result = await pool.query(`SELECT achievement_id FROM user_achievements WHERE user_id = $1`, [userId]);
    return new Set(result.rows.map((row) => row.achievement_id));
  }

  async awardAchievement(userId: string, achievementId: string): Promise<void> {
    await pool.query(
      `INSERT INTO user_achievements (user_id, achievement_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, achievement_id) DO NOTHING`,
      [userId, achievementId],
    );
  }

  private async getCurrentStreak(userId: string): Promise<number> {
    const result = await pool.query(
      `SELECT DISTINCT DATE(last_read_at) AS study_date
       FROM lesson_progress
       WHERE user_id = $1
       ORDER BY study_date DESC
       LIMIT 60`,
      [userId],
    );
    const dates = result.rows.map((row) => new Date(row.study_date).toISOString().slice(0, 10));
    let streak = 0;
    const current = new Date();

    for (const date of dates) {
      const expected = new Date();
      expected.setDate(current.getDate() - streak);
      if (date !== expected.toISOString().slice(0, 10)) break;
      streak += 1;
    }

    return streak;
  }
}
