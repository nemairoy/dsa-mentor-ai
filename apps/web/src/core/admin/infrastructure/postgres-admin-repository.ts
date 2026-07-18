import type { QueryResultRow } from "pg";

import type { AdminPrincipal, ContentDraftInput } from "@/core/admin/domain/admin";
import { pool } from "@/infrastructure/database/postgres";

function mapPrincipal(row: QueryResultRow): AdminPrincipal {
  return {
    userId: row.user_id,
    role: row.role_id,
    permissions: row.permissions ?? [],
    rank: Number(row.rank),
  };
}

export class PostgresAdminRepository {
  async getPrincipal(userId: string): Promise<AdminPrincipal | null> {
    const result = await pool.query(
      `SELECT aur.user_id, aur.role_id, ar.permissions, ar.rank
       FROM admin_user_roles aur
       JOIN admin_roles ar ON ar.id = aur.role_id
       WHERE aur.user_id = $1
       LIMIT 1`,
      [userId],
    );

    return result.rows[0] ? mapPrincipal(result.rows[0]) : null;
  }

  async overview(contentStats: { chapters: number; lessons: number; animations: number }, ragStats: { chunks: number; indexedLessons: number }) {
    const result = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM "user") AS users,
        (SELECT COUNT(*) FROM practice_problems) AS practice_problems,
        (SELECT COUNT(*) FROM ai_chat_history) AS ai_usage,
        (SELECT COUNT(*) FROM content_drafts) AS drafts`,
    );
    const recent = await pool.query(
      `SELECT action, entity_type, created_at
       FROM admin_audit_log
       ORDER BY created_at DESC
       LIMIT 10`,
    );
    const row = result.rows[0];

    return {
      users: Number(row.users ?? 0),
      chapters: contentStats.chapters,
      lessons: contentStats.lessons,
      practiceProblems: Number(row.practice_problems ?? 0),
      animations: contentStats.animations,
      aiUsage: Number(row.ai_usage ?? 0),
      drafts: Number(row.drafts ?? 0),
      ragChunks: ragStats.chunks,
      indexedLessons: ragStats.indexedLessons,
      recentActivity: recent.rows.map((item) => ({
        action: item.action,
        entityType: item.entity_type,
        createdAt: item.created_at,
      })),
    };
  }

  async listUsers() {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.image, aur.role_id
       FROM "user" u
       LEFT JOIN admin_user_roles aur ON aur.user_id = u.id
       ORDER BY u."createdAt" DESC
       LIMIT 100`,
    );
    return result.rows;
  }

  async assignRole(actorUserId: string, userId: string, roleId: string) {
    await pool.query(
      `INSERT INTO admin_user_roles (user_id, role_id, assigned_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id)
       DO UPDATE SET role_id = EXCLUDED.role_id, assigned_by = EXCLUDED.assigned_by, assigned_at = NOW()`,
      [userId, roleId, actorUserId],
    );
    await this.audit(actorUserId, "role.assigned", "user", userId, null, { roleId });
  }

  async listDrafts() {
    const result = await pool.query(
      `SELECT id, content_type, chapter_slug, lesson_slug, title, status, author_id, updated_at
       FROM content_drafts
       ORDER BY updated_at DESC
       LIMIT 100`,
    );
    return result.rows;
  }

  async saveDraft(userId: string, input: ContentDraftInput) {
    const result = await pool.query(
      `INSERT INTO content_drafts (content_type, chapter_slug, lesson_slug, title, markdown, metadata, status, author_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        input.contentType,
        input.chapterSlug ?? null,
        input.lessonSlug ?? null,
        input.title,
        input.markdown ?? null,
        JSON.stringify(input.metadata),
        input.status,
        userId,
      ],
    );
    const draftId = result.rows[0].id;
    await pool.query(
      `INSERT INTO content_versions (draft_id, version_number, markdown, metadata, created_by)
       VALUES ($1, 1, $2, $3, $4)`,
      [draftId, input.markdown ?? null, JSON.stringify(input.metadata), userId],
    );
    await this.audit(userId, "content.draft.created", input.contentType, draftId, null, input);
    return { id: draftId };
  }

  async saveAiAuthoring(userId: string, feature: string, prompt: string, output: string) {
    await pool.query(
      `INSERT INTO ai_authoring_requests (user_id, feature, prompt, output)
       VALUES ($1, $2, $3, $4)`,
      [userId, feature, prompt, output],
    );
    await this.audit(userId, "ai.authoring.generated", "ai_authoring", feature, null, { feature });
  }

  async audit(actorUserId: string, action: string, entityType: string, entityId: string | null, before: unknown, after: unknown) {
    await pool.query(
      `INSERT INTO admin_audit_log (actor_user_id, action, entity_type, entity_id, before_state, after_state)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [actorUserId, action, entityType, entityId, before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null],
    );
  }
}

