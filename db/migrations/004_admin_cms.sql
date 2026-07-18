CREATE TABLE IF NOT EXISTS admin_roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rank INTEGER NOT NULL,
    permissions TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL REFERENCES admin_roles(id) ON DELETE RESTRICT,
    assigned_by TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_user_roles_user_id ON admin_user_roles(user_id);

CREATE TABLE IF NOT EXISTS content_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL CHECK (content_type IN ('chapter', 'lesson', 'practice', 'animation')),
    chapter_slug TEXT,
    lesson_slug TEXT,
    title TEXT NOT NULL,
    markdown TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    author_id TEXT NOT NULL,
    reviewer_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_content_drafts_status ON content_drafts(status);
CREATE INDEX IF NOT EXISTS idx_content_drafts_lesson ON content_drafts(chapter_slug, lesson_slug);

CREATE TABLE IF NOT EXISTS content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES content_drafts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    markdown TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(draft_id, version_number)
);

CREATE TABLE IF NOT EXISTS cms_media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    url TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_authoring_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    feature TEXT NOT NULL,
    prompt TEXT NOT NULL,
    output TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    before_state JSONB,
    after_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_actor ON admin_audit_log(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_entity ON admin_audit_log(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS rag_retrieval_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    query TEXT NOT NULL,
    top_k INTEGER NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}'::jsonb,
    result_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    query TEXT NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}'::jsonb,
    result_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO admin_roles (id, name, rank, permissions)
VALUES
    ('student', 'Student', 10, '{}'),
    ('content_creator', 'Content Creator', 30, ARRAY['content:read','content:write','ai:author']),
    ('reviewer', 'Reviewer', 50, ARRAY['content:read','content:write','content:review','ai:author']),
    ('administrator', 'Administrator', 80, ARRAY['content:*','practice:*','animation:*','search:*','rag:*','users:read','analytics:read','ai:author']),
    ('super_administrator', 'Super Administrator', 100, ARRAY['*'])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    rank = EXCLUDED.rank,
    permissions = EXCLUDED.permissions;

DROP TRIGGER IF EXISTS set_content_drafts_updated_at ON content_drafts;
CREATE TRIGGER set_content_drafts_updated_at
BEFORE UPDATE ON content_drafts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

