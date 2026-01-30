-- Migration: 005_rls_policies
-- Description: Enable Row Level Security and create policies
-- Created: 2026-01-29

BEGIN;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dice_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_providers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Anyone can read basic profile info
CREATE POLICY "Public profiles readable"
  ON users FOR SELECT
  USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- USER ROLES POLICIES
-- ============================================

-- Users can view own roles
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage roles
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CHARACTERS POLICIES
-- ============================================

-- Users can only see their own characters
CREATE POLICY "Users can view own characters"
  ON characters FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create characters for themselves
CREATE POLICY "Users can create own characters"
  ON characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own characters
CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own characters
CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  USING (auth.uid() = user_id);

-- Session participants can view characters in their session (for party display)
CREATE POLICY "Session participants can view party characters"
  ON characters FOR SELECT
  USING (
    id IN (
      SELECT sp.character_id FROM session_players sp
      WHERE sp.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM sessions s WHERE s.id = sp.session_id AND s.seer_id = auth.uid()
      )
    )
  );

-- ============================================
-- ADVENTURES POLICIES
-- ============================================

-- Published adventures are visible to all
CREATE POLICY "Published adventures visible to all"
  ON adventures FOR SELECT
  USING (status = 'published' OR auth.uid() = creator_id);

-- Only creator can insert
CREATE POLICY "Creators can insert adventures"
  ON adventures FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Only creator can update
CREATE POLICY "Creators can update own adventures"
  ON adventures FOR UPDATE
  USING (auth.uid() = creator_id);

-- Only creator can delete
CREATE POLICY "Creators can delete own adventures"
  ON adventures FOR DELETE
  USING (auth.uid() = creator_id);

-- ============================================
-- CREATURES POLICIES
-- ============================================

-- Creatures visible if adventure is visible
CREATE POLICY "Creatures visible with adventure"
  ON creatures FOR SELECT
  USING (
    adventure_id IN (
      SELECT id FROM adventures 
      WHERE status = 'published' OR creator_id = auth.uid()
    )
  );

-- Only adventure creator can manage creatures
CREATE POLICY "Adventure creator can manage creatures"
  ON creatures FOR ALL
  USING (
    adventure_id IN (
      SELECT id FROM adventures WHERE creator_id = auth.uid()
    )
  );

-- ============================================
-- SESSIONS POLICIES
-- ============================================

-- Public sessions visible to all, private to participants
CREATE POLICY "Sessions visible to participants or public"
  ON sessions FOR SELECT
  USING (
    is_public = true
    OR seer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM session_players 
      WHERE session_id = id AND user_id = auth.uid()
    )
  );

-- Only Seers can create sessions (must have seer role)
CREATE POLICY "Seers can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    auth.uid() = seer_id
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('seer', 'admin')
    )
  );

-- Only Seer can update session
CREATE POLICY "Seer can update session"
  ON sessions FOR UPDATE
  USING (auth.uid() = seer_id);

-- Only Seer can delete session
CREATE POLICY "Seer can delete session"
  ON sessions FOR DELETE
  USING (auth.uid() = seer_id);

-- ============================================
-- SESSION PLAYERS POLICIES
-- ============================================

-- Players and Seer can see session players
CREATE POLICY "Session participants can view players"
  ON session_players FOR SELECT
  USING (
    user_id = auth.uid()
    OR session_id IN (SELECT id FROM sessions WHERE seer_id = auth.uid())
    OR session_id IN (SELECT session_id FROM session_players WHERE user_id = auth.uid())
  );

-- Users can join sessions (insert themselves)
CREATE POLICY "Users can join sessions"
  ON session_players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own session membership
CREATE POLICY "Users can update own session membership"
  ON session_players FOR UPDATE
  USING (auth.uid() = user_id);

-- Seer can manage all session players
CREATE POLICY "Seer can manage session players"
  ON session_players FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions WHERE seer_id = auth.uid())
  );

-- ============================================
-- SESSION EVENTS POLICIES
-- ============================================

-- Session participants can view events
CREATE POLICY "Session participants can view events"
  ON session_events FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE seer_id = auth.uid()
      UNION
      SELECT session_id FROM session_players WHERE user_id = auth.uid()
    )
  );

-- Session participants can create events
CREATE POLICY "Session participants can create events"
  ON session_events FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE seer_id = auth.uid()
      UNION
      SELECT session_id FROM session_players WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- DICE ROLLS POLICIES
-- ============================================

-- Dice rolls visible to session participants
CREATE POLICY "Dice rolls visible to session participants"
  ON dice_rolls FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE seer_id = auth.uid()
      UNION
      SELECT session_id FROM session_players WHERE user_id = auth.uid()
    )
  );

-- Players can roll for own characters, Seer can roll for NPCs
CREATE POLICY "Players can create rolls for own characters"
  ON dice_rolls FOR INSERT
  WITH CHECK (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
    OR session_id IN (SELECT id FROM sessions WHERE seer_id = auth.uid())
  );

-- ============================================
-- TUTORIAL PROGRESS POLICIES
-- ============================================

-- Users can view own tutorial progress
CREATE POLICY "Users can view own tutorial progress"
  ON tutorial_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update own tutorial progress
CREATE POLICY "Users can manage own tutorial progress"
  ON tutorial_progress FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- LINKED PROVIDERS POLICIES
-- ============================================

-- Users can view own linked providers
CREATE POLICY "Users can view own linked providers"
  ON linked_providers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage own linked providers
CREATE POLICY "Users can manage own linked providers"
  ON linked_providers FOR ALL
  USING (auth.uid() = user_id);

COMMIT;
