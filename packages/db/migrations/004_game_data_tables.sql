-- Migration: 004_game_data_tables
-- Description: Create dice rolls, tutorial progress, and linked providers tables
-- Created: 2026-01-29

BEGIN;

-- ============================================
-- DICE ROLLS TABLE
-- ============================================
CREATE TABLE dice_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id),
  character_name TEXT NOT NULL,  -- Denormalized for quick display
  
  -- Roll parameters
  attribute attribute NOT NULL,
  dice_count INTEGER NOT NULL CHECK (dice_count BETWEEN 1 AND 10),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 3 AND 18),
  roll_type roll_type NOT NULL,
  modifiers JSONB NOT NULL DEFAULT '[]',
  
  -- Results
  results INTEGER[] NOT NULL,
  total INTEGER NOT NULL,
  modified_total INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  outcome roll_outcome NOT NULL,
  margin INTEGER NOT NULL,  -- How much over/under difficulty
  
  -- Display
  description TEXT,
  animation_seed BIGINT,  -- For reproducible roll animations
  
  -- Heroic save tracking (if this roll was a reroll)
  original_roll_id UUID REFERENCES dice_rolls(id),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure results array length matches dice_count
  CONSTRAINT valid_results CHECK (array_length(results, 1) = dice_count)
);

-- Indexes for dice_rolls
CREATE INDEX idx_dice_rolls_session ON dice_rolls(session_id);
CREATE INDEX idx_dice_rolls_character ON dice_rolls(character_id);
CREATE INDEX idx_dice_rolls_created ON dice_rolls(created_at DESC);
CREATE INDEX idx_dice_rolls_type ON dice_rolls(session_id, roll_type);

-- ============================================
-- TUTORIAL PROGRESS TABLE
-- ============================================
CREATE TABLE tutorial_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  path tutorial_path,
  current_step TEXT NOT NULL DEFAULT 'welcome',
  completed_steps TEXT[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tutorial_completed ON tutorial_progress(completed_at) 
  WHERE completed_at IS NOT NULL;

-- ============================================
-- LINKED PROVIDERS TABLE (OAuth provider linking)
-- ============================================
CREATE TABLE linked_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_linked_providers_user_id ON linked_providers(user_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with that column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adventures_updated_at
  BEFORE UPDATE ON adventures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creatures_updated_at
  BEFORE UPDATE ON creatures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutorial_progress_updated_at
  BEFORE UPDATE ON tutorial_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
