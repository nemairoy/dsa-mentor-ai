CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_last_read
ON lesson_progress(user_id, last_read_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_status
ON lesson_progress(user_id, status);

CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_updated
ON lesson_notes(user_id, updated_at DESC)
WHERE LENGTH(TRIM(body)) > 0;

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_status_problem
ON practice_attempts(user_id, status, problem_id);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_created
ON practice_attempts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visualization_usage_user_created
ON visualization_usage(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_created
ON ai_chat_history(user_id, created_at DESC);
