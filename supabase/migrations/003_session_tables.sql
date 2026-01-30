-- Migration: 003_session_tables
-- Description: Create session management tables
-- Created: 2026-01-29

BEGIN;

-- ============================================
-- SESSIONS TABLE (Game sessions)
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seer_id UUID NOT NULL REFERENCES users(id),
  adventure_id UUID NOT NULL REFERENCES adventures(id),
  
  -- Session config
  code CHAR(6) NOT NULL UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  max_players INTEGER NOT NULL DEFAULT 4 CHECK (max_players BETWEEN 2 AND 6),
  looking_for TEXT,  -- Party composition note
  
  -- Scheduling
  scheduled_start TIMESTAMPTZ,
  
  -- Game state
  status session_status NOT NULL DEFAULT 'waiting',
  current_scene_id TEXT,
  current_encounter_id TEXT,
  game_state JSONB NOT NULL DEFAULT '{}',
  
  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_code CHECK (code ~ '^[A-Z0-9]{6}$')
);

-- Indexes for sessions
CREATE INDEX idx_sessions_seer_id ON sessions(seer_id);
CREATE INDEX idx_sessions_adventure_id ON sessions(adventure_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_sessions_public_waiting ON sessions(is_public, status, scheduled_start)
  WHERE is_public = true AND status IN ('waiting', 'starting_soon');

-- Generate unique session code automatically
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code CHAR(6);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 6-character alphanumeric code
    new_code := upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM sessions WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  NEW.code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_session_code
  BEFORE INSERT ON sessions
  FOR EACH ROW
  WHEN (NEW.code IS NULL)
  EXECUTE FUNCTION generate_session_code();

-- ============================================
-- SESSION PLAYERS TABLE (Join table)
-- ============================================
CREATE TABLE session_players (
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  character_id UUID NOT NULL REFERENCES characters(id),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  heroic_saves_used INTEGER NOT NULL DEFAULT 0,
  
  -- Timing
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  PRIMARY KEY (session_id, user_id)
);

-- Indexes for session_players
CREATE INDEX idx_session_players_character ON session_players(character_id);
CREATE INDEX idx_session_players_active ON session_players(session_id) 
  WHERE is_active = true;

-- Enforce max players per session
CREATE OR REPLACE FUNCTION check_session_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count 
  FROM session_players 
  WHERE session_id = NEW.session_id AND is_active = true;
  
  SELECT max_players INTO max_count 
  FROM sessions 
  WHERE id = NEW.session_id;
  
  IF current_count >= max_count THEN
    RAISE EXCEPTION 'Session is full';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_session_capacity
  BEFORE INSERT ON session_players
  FOR EACH ROW EXECUTE FUNCTION check_session_capacity();

-- ============================================
-- SESSION EVENTS TABLE (Real-time events for Supabase Realtime)
-- ============================================
CREATE TABLE session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for session_events
CREATE INDEX idx_session_events_session ON session_events(session_id);
CREATE INDEX idx_session_events_created ON session_events(session_id, created_at DESC);

-- Auto-cleanup old events (keep 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM session_events 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_events_trigger
  AFTER INSERT ON session_events
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_old_events();

COMMIT;
