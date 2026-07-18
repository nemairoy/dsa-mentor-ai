CREATE TABLE IF NOT EXISTS lesson_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    chapter_slug TEXT NOT NULL,
    lesson_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, chapter_slug, lesson_slug)
);

CREATE INDEX IF NOT EXISTS idx_lesson_bookmarks_user_id ON lesson_bookmarks(user_id);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    chapter_slug TEXT NOT NULL,
    lesson_slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('not_started', 'started', 'completed')),
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    current_lesson BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, chapter_slug, lesson_slug)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_current ON lesson_progress(user_id, current_lesson);

CREATE TABLE IF NOT EXISTS lesson_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    chapter_slug TEXT NOT NULL,
    lesson_slug TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, chapter_slug, lesson_slug)
);

CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_id ON lesson_notes(user_id);

CREATE TABLE IF NOT EXISTS ai_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    chapter_slug TEXT NOT NULL,
    lesson_slug TEXT NOT NULL,
    feature TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_lesson ON ai_chat_history(user_id, chapter_slug, lesson_slug, created_at DESC);

DROP TRIGGER IF EXISTS set_lesson_progress_updated_at ON lesson_progress;
CREATE TRIGGER set_lesson_progress_updated_at
BEFORE UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_lesson_notes_updated_at ON lesson_notes;
CREATE TRIGGER set_lesson_notes_updated_at
BEFORE UPDATE ON lesson_notes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

