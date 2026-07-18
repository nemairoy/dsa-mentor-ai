import type { QueryResultRow } from "pg";

import type { ProfileInput, ProfileRepository, UserProfile } from "@/core/profile/domain/profile";
import { pool } from "@/infrastructure/database/postgres";

function mapProfile(row: QueryResultRow): UserProfile {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    age: row.age,
    profilePictureUrl: row.profile_picture_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresProfileRepository implements ProfileRepository {
  async findByUserId(userId: string): Promise<UserProfile | null> {
    const result = await pool.query(
      `SELECT id, user_id, full_name, age, profile_picture_url, created_at, updated_at
       FROM user_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [userId],
    );

    return result.rows[0] ? mapProfile(result.rows[0]) : null;
  }

  async upsert(userId: string, input: ProfileInput): Promise<UserProfile> {
    const result = await pool.query(
      `INSERT INTO user_profiles (user_id, full_name, age, profile_picture_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         full_name = EXCLUDED.full_name,
         age = EXCLUDED.age,
         profile_picture_url = EXCLUDED.profile_picture_url
       RETURNING id, user_id, full_name, age, profile_picture_url, created_at, updated_at`,
      [userId, input.fullName, input.age, input.profilePictureUrl ?? null],
    );

    return mapProfile(result.rows[0]);
  }
}

