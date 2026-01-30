-- Migration: 006_stored_procedures
-- Description: Create stored procedures and helper functions
-- Created: 2026-01-29

BEGIN;

-- ============================================
-- GET SESSION DETAILS
-- Returns complete session info with players and adventure data
-- ============================================
CREATE OR REPLACE FUNCTION get_session_details(p_session_id UUID)
RETURNS TABLE (
  session_data JSONB,
  players JSONB,
  adventure_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(s.*) AS session_data,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'userId', sp.user_id,
          'characterId', sp.character_id,
          'characterName', c.name,
          'characterClass', c.class,
          'displayName', u.display_name,
          'avatarUrl', u.avatar_url,
          'joinedAt', sp.joined_at,
          'isActive', sp.is_active,
          'heroicSavesUsed', sp.heroic_saves_used
        )
      )
      FROM session_players sp
      JOIN characters c ON sp.character_id = c.id
      JOIN users u ON sp.user_id = u.id
      WHERE sp.session_id = p_session_id
    ) AS players,
    to_jsonb(a.*) AS adventure_data
  FROM sessions s
  JOIN adventures a ON s.adventure_id = a.id
  WHERE s.id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE USER STATS ON SESSION COMPLETE
-- ============================================
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update games_run for Seer
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE users 
    SET games_run = games_run + 1 
    WHERE id = NEW.seer_id;
    
    -- Update games_played for all participants
    UPDATE users 
    SET games_played = games_played + 1 
    WHERE id IN (
      SELECT user_id FROM session_players WHERE session_id = NEW.id
    );
    
    -- Update adventure play count
    UPDATE adventures 
    SET times_played = times_played + 1 
    WHERE id = NEW.adventure_id;
    
    -- Update last_played_at for all characters in session
    UPDATE characters
    SET last_played_at = NOW()
    WHERE id IN (
      SELECT character_id FROM session_players WHERE session_id = NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_session_complete
  AFTER UPDATE ON sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_user_stats();

-- ============================================
-- CHECK USER HAS ROLE
-- Helper function for authorization checks
-- ============================================
CREATE OR REPLACE FUNCTION user_has_role(p_user_id UUID, p_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id 
    AND (role = p_role OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET USER ROLES
-- Returns all roles for a user
-- ============================================
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS user_role[] AS $$
DECLARE
  roles user_role[];
BEGIN
  SELECT array_agg(role) INTO roles
  FROM user_roles
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(roles, ARRAY['player']::user_role[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIND SESSION BY CODE
-- Public function to look up a session by its join code
-- ============================================
CREATE OR REPLACE FUNCTION find_session_by_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  adventure_name TEXT,
  seer_name TEXT,
  status session_status,
  player_count INTEGER,
  max_players INTEGER,
  is_public BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    a.name AS adventure_name,
    u.display_name AS seer_name,
    s.status,
    (SELECT COUNT(*)::INTEGER FROM session_players sp WHERE sp.session_id = s.id AND sp.is_active = true) AS player_count,
    s.max_players,
    s.is_public
  FROM sessions s
  JOIN adventures a ON s.adventure_id = a.id
  JOIN users u ON s.seer_id = u.id
  WHERE s.code = upper(p_code)
    AND s.status IN ('waiting', 'starting_soon');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CALCULATE ROLL OUTCOME
-- Determines success/failure and outcome type
-- ============================================
CREATE OR REPLACE FUNCTION calculate_roll_outcome(
  p_total INTEGER,
  p_difficulty INTEGER,
  p_results INTEGER[]
)
RETURNS TABLE (
  success BOOLEAN,
  outcome roll_outcome,
  margin INTEGER
) AS $$
DECLARE
  all_ones BOOLEAN;
  all_sixes BOOLEAN;
BEGIN
  -- Check for critical results
  all_ones := NOT EXISTS (SELECT 1 FROM unnest(p_results) r WHERE r != 1);
  all_sixes := NOT EXISTS (SELECT 1 FROM unnest(p_results) r WHERE r != 6);
  
  -- Calculate margin (positive = over difficulty, negative = under)
  margin := p_total - p_difficulty;
  success := p_total >= p_difficulty;
  
  -- Determine outcome
  IF all_sixes THEN
    outcome := 'critical_success';
    success := true;
  ELSIF all_ones THEN
    outcome := 'critical_failure';
    success := false;
  ELSIF success THEN
    outcome := 'success';
  ELSE
    outcome := 'failure';
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- GET BROWSE SESSIONS
-- Returns public sessions available to join
-- ============================================
CREATE OR REPLACE FUNCTION get_browse_sessions(
  p_difficulty difficulty_level DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  session_id UUID,
  code CHAR(6),
  status session_status,
  adventure_name TEXT,
  adventure_thumbnail TEXT,
  difficulty difficulty_level,
  seer_name TEXT,
  seer_avatar TEXT,
  player_count INTEGER,
  max_players INTEGER,
  scheduled_start TIMESTAMPTZ,
  looking_for TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS session_id,
    s.code,
    s.status,
    a.name AS adventure_name,
    a.thumbnail_url AS adventure_thumbnail,
    a.difficulty,
    u.display_name AS seer_name,
    u.avatar_url AS seer_avatar,
    (SELECT COUNT(*)::INTEGER FROM session_players sp WHERE sp.session_id = s.id AND sp.is_active = true) AS player_count,
    s.max_players,
    s.scheduled_start,
    s.looking_for
  FROM sessions s
  JOIN adventures a ON s.adventure_id = a.id
  JOIN users u ON s.seer_id = u.id
  WHERE s.is_public = true 
    AND s.status IN ('waiting', 'starting_soon')
    AND (p_difficulty IS NULL OR a.difficulty = p_difficulty)
  GROUP BY s.id, a.id, u.id
  HAVING (SELECT COUNT(*) FROM session_players sp WHERE sp.session_id = s.id AND sp.is_active = true) < s.max_players
  ORDER BY s.scheduled_start NULLS LAST, s.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
