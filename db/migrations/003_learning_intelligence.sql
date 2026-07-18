CREATE TABLE IF NOT EXISTS practice_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_key TEXT NOT NULL UNIQUE,
    lesson_id TEXT NOT NULL,
    chapter_slug TEXT NOT NULL,
    lesson_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    company_tags TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    explanation TEXT NOT NULL,
    hints TEXT[] NOT NULL DEFAULT '{}',
    editorial_placeholder TEXT NOT NULL DEFAULT '',
    solution_placeholder TEXT NOT NULL DEFAULT '',
    future_test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    future_judge_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    related_lessons TEXT[] NOT NULL DEFAULT '{}',
    related_algorithms TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_problems_lesson ON practice_problems(chapter_slug, lesson_slug);
CREATE INDEX IF NOT EXISTS idx_practice_problems_difficulty ON practice_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_practice_problems_tags ON practice_problems USING GIN(tags);

CREATE TABLE IF NOT EXISTS practice_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    problem_id UUID NOT NULL REFERENCES practice_problems(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('attempted', 'solved', 'review')),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    mistakes TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user ON practice_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_problem ON practice_attempts(problem_id);

CREATE TABLE IF NOT EXISTS visualization_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    animation_id TEXT NOT NULL,
    lesson_id TEXT,
    event TEXT NOT NULL CHECK (event IN ('opened', 'played', 'completed')),
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visualization_usage_user ON visualization_usage(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS revision_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    chapter_slug TEXT NOT NULL,
    lesson_slug TEXT NOT NULL,
    reason TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    due_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_revision_items_due ON revision_items(user_id, due_at, completed_at);

CREATE TABLE IF NOT EXISTS achievement_definitions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    badge TEXT NOT NULL,
    criteria JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

CREATE TABLE IF NOT EXISTS learning_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    summary JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, report_type, period_start, period_end)
);

INSERT INTO achievement_definitions (id, title, description, xp, badge, criteria)
VALUES
    ('first_lesson', 'First Step', 'Complete your first lesson.', 50, 'milestone', '{"completedLessons":1}'),
    ('ten_lessons', 'Consistent Learner', 'Complete 10 lessons.', 150, 'streak', '{"completedLessons":10}'),
    ('problem_solver', 'Problem Solver', 'Solve 10 practice problems.', 200, 'practice', '{"solvedProblems":10}'),
    ('ai_explorer', 'AI Explorer', 'Ask 10 AI questions.', 100, 'ai', '{"aiConversations":10}'),
    ('visualization_master', 'Visualization Master', 'Open 10 visualizations.', 150, 'visualization', '{"visualizations":10}'),
    ('perfect_week', 'Perfect Week', 'Study on 7 distinct days in a week.', 250, 'streak', '{"studyDays":7}')
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS set_practice_problems_updated_at ON practice_problems;
CREATE TRIGGER set_practice_problems_updated_at
BEFORE UPDATE ON practice_problems
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

