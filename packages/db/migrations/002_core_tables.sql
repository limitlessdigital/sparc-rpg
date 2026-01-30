-- Migration: 002_core_tables
-- Description: Create core tables - users, characters, adventures
-- Created: 2026-01-29

BEGIN;

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  games_played INTEGER NOT NULL DEFAULT 0,
  games_run INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_display_name ON users(display_name);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Auto-create profile on signup trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- USER ROLES TABLE
-- ============================================
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'player',
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Auto-assign player role on user creation
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'player');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_assign_role
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION assign_default_role();

-- ============================================
-- CHARACTERS TABLE
-- ============================================
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class character_class NOT NULL,
  
  -- Attributes (1-6 each)
  might INTEGER NOT NULL CHECK (might BETWEEN 1 AND 6),
  grace INTEGER NOT NULL CHECK (grace BETWEEN 1 AND 6),
  wit INTEGER NOT NULL CHECK (wit BETWEEN 1 AND 6),
  heart INTEGER NOT NULL CHECK (heart BETWEEN 1 AND 6),
  
  -- Status
  hit_points INTEGER NOT NULL DEFAULT 6 CHECK (hit_points BETWEEN 0 AND 6),
  max_hit_points INTEGER NOT NULL DEFAULT 6 CHECK (max_hit_points BETWEEN 1 AND 10),
  experience INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 10),
  
  -- Equipment and abilities (JSONB for flexibility)
  equipment JSONB NOT NULL DEFAULT '[]',
  special_ability JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_character_name UNIQUE (user_id, name),
  CONSTRAINT valid_name CHECK (char_length(name) BETWEEN 2 AND 50)
);

-- Indexes for characters
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_class ON characters(class);
CREATE INDEX idx_characters_last_played ON characters(last_played_at DESC NULLS LAST);

-- Limit characters per user (max 10)
CREATE OR REPLACE FUNCTION check_character_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM characters WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'Character limit reached (maximum 10)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_character_limit
  BEFORE INSERT ON characters
  FOR EACH ROW EXECUTE FUNCTION check_character_limit();

-- ============================================
-- ADVENTURES TABLE
-- ============================================
CREATE TABLE adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  artwork_url TEXT,
  
  -- Game settings
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  estimated_duration INTEGER NOT NULL DEFAULT 60, -- minutes
  min_players INTEGER NOT NULL DEFAULT 2 CHECK (min_players BETWEEN 1 AND 6),
  max_players INTEGER NOT NULL DEFAULT 4 CHECK (max_players BETWEEN 1 AND 6),
  
  -- Content (Adventure Forge data - scenes, encounters, NPCs, etc.)
  content JSONB NOT NULL DEFAULT '{}',
  
  -- Publishing status
  status adventure_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  
  -- Validation
  is_valid BOOLEAN NOT NULL DEFAULT false,
  validation_errors JSONB NOT NULL DEFAULT '[]',
  
  -- Stats
  times_played INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3, 2),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_player_range CHECK (min_players <= max_players),
  CONSTRAINT valid_name CHECK (char_length(name) BETWEEN 3 AND 100)
);

-- Indexes for adventures
CREATE INDEX idx_adventures_creator_id ON adventures(creator_id);
CREATE INDEX idx_adventures_status ON adventures(status);
CREATE INDEX idx_adventures_published ON adventures(published_at DESC) 
  WHERE status = 'published';
CREATE INDEX idx_adventures_difficulty ON adventures(difficulty) 
  WHERE status = 'published';
CREATE INDEX idx_adventures_content ON adventures USING gin(content);

-- ============================================
-- CREATURES TABLE (NPCs and monsters for adventures)
-- ============================================
CREATE TABLE creatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Stats (JSONB for flexibility)
  stats JSONB NOT NULL DEFAULT '{}',
  abilities JSONB NOT NULL DEFAULT '[]',
  
  -- Combat info
  hit_points INTEGER NOT NULL DEFAULT 1,
  armor INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_creatures_adventure_id ON creatures(adventure_id);

COMMIT;
