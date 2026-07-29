-- Lock down public-schema tables for Supabase's Data API.
-- The app uses a server-side Postgres connection, so removing anon/authenticated
-- table grants protects Supabase REST access without changing normal app queries.

BEGIN;

CREATE OR REPLACE FUNCTION public.app_current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    NULLIF(current_setting('request.jwt.claim.user_id', true), ''),
    NULLIF(current_setting('app.current_user_id', true), '')
  )
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'user_profiles',
    'lesson_bookmarks',
    'lesson_progress',
    'lesson_notes',
    'ai_chat_history',
    'practice_problems',
    'practice_attempts',
    'visualization_usage',
    'revision_items',
    'achievement_definitions',
    'user_achievements',
    'learning_reports',
    'admin_roles',
    'admin_user_roles',
    'content_drafts',
    'content_versions',
    'cms_media_assets',
    'ai_authoring_requests',
    'admin_audit_log',
    'rag_retrieval_logs',
    'search_logs',
    'user',
    'session',
    'account',
    'verification'
  ]
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
    REVOKE EXECUTE ON FUNCTION public.app_current_user_id() FROM anon;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
    REVOKE EXECUTE ON FUNCTION public.app_current_user_id() FROM authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM authenticated;
  END IF;
END $$;

DO $$
DECLARE
  table_name text;
  policy_prefix text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'user_profiles',
    'lesson_bookmarks',
    'lesson_progress',
    'lesson_notes',
    'ai_chat_history',
    'practice_attempts',
    'visualization_usage',
    'revision_items',
    'user_achievements',
    'learning_reports',
    'ai_authoring_requests'
  ]
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      policy_prefix := table_name || '_owner';

      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_prefix || '_select', table_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_prefix || '_insert', table_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_prefix || '_update', table_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_prefix || '_delete', table_name);

      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT USING (user_id = public.app_current_user_id())',
        policy_prefix || '_select',
        table_name
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (user_id = public.app_current_user_id())',
        policy_prefix || '_insert',
        table_name
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE USING (user_id = public.app_current_user_id()) WITH CHECK (user_id = public.app_current_user_id())',
        policy_prefix || '_update',
        table_name
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE USING (user_id = public.app_current_user_id())',
        policy_prefix || '_delete',
        table_name
      );
    END IF;
  END LOOP;
END $$;

COMMIT;
