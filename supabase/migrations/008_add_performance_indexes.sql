-- Migration: Add performance indexes
-- Fixes 71 performance issues from Supabase linter

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Characters indexes
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_class ON public.characters(class);
CREATE INDEX IF NOT EXISTS idx_characters_level ON public.characters(level);
CREATE INDEX IF NOT EXISTS idx_characters_created_at ON public.characters(created_at);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_seer_id ON public.sessions(seer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_adventure_id ON public.sessions(adventure_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_code ON public.sessions(code);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_public ON public.sessions(is_public) WHERE is_public = true;

-- Session Players indexes
CREATE INDEX IF NOT EXISTS idx_session_players_session_id ON public.session_players(session_id);
CREATE INDEX IF NOT EXISTS idx_session_players_user_id ON public.session_players(user_id);
CREATE INDEX IF NOT EXISTS idx_session_players_character_id ON public.session_players(character_id);

-- Adventures indexes
CREATE INDEX IF NOT EXISTS idx_adventures_creator_id ON public.adventures(creator_id);
CREATE INDEX IF NOT EXISTS idx_adventures_status ON public.adventures(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_adventures_difficulty ON public.adventures(difficulty);
CREATE INDEX IF NOT EXISTS idx_adventures_created_at ON public.adventures(created_at);

-- User Roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Creatures indexes (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'creatures') THEN
        CREATE INDEX IF NOT EXISTS idx_creatures_adventure_id ON public.creatures(adventure_id);
        -- type column may not exist in all schemas
    END IF;
END $$;

-- Items indexes (if exists) - skipped, table may not exist in this schema

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sessions_public_status ON public.sessions(is_public, status) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_characters_user_level ON public.characters(user_id, level DESC);

-- Add comment
COMMENT ON INDEX idx_sessions_seer_id IS 'Index for finding sessions by GM';
COMMENT ON INDEX idx_characters_user_id IS 'Index for finding characters by owner';
