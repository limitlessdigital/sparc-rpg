-- Migration: 009_fix_rls_performance
-- Description: Fix RLS policies to use (select auth.uid()) for better performance
-- This prevents per-row re-evaluation of auth functions
-- Created: 2026-01-29

BEGIN;

-- ============================================
-- DROP AND RECREATE ALL RLS POLICIES
-- Using (select auth.uid()) instead of auth.uid()
-- ============================================

-- USERS POLICIES
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING ((select auth.uid()) = id);

-- USER ROLES POLICIES
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid()) AND role = 'admin'
    )
  );

-- CHARACTERS POLICIES
DROP POLICY IF EXISTS "Users can view own characters" ON characters;
CREATE POLICY "Users can view own characters"
  ON characters FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own characters" ON characters;
CREATE POLICY "Users can create own characters"
  ON characters FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own characters" ON characters;
CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own characters" ON characters;
CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Session participants can view party characters" ON characters;
CREATE POLICY "Session participants can view party characters"
  ON characters FOR SELECT
  USING (
    id IN (
      SELECT sp.character_id FROM session_players sp
      WHERE sp.user_id = (select auth.uid()) OR EXISTS (
        SELECT 1 FROM sessions s WHERE s.id = sp.session_id AND s.seer_id = (select auth.uid())
      )
    )
  );

-- ADVENTURES POLICIES
DROP POLICY IF EXISTS "Published adventures visible to all" ON adventures;
CREATE POLICY "Published adventures visible to all"
  ON adventures FOR SELECT
  USING (status = 'published' OR (select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "Creators can insert adventures" ON adventures;
CREATE POLICY "Creators can insert adventures"
  ON adventures FOR INSERT
  WITH CHECK ((select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "Creators can update own adventures" ON adventures;
CREATE POLICY "Creators can update own adventures"
  ON adventures FOR UPDATE
  USING ((select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "Creators can delete own adventures" ON adventures;
CREATE POLICY "Creators can delete own adventures"
  ON adventures FOR DELETE
  USING ((select auth.uid()) = creator_id);

-- CREATURES POLICIES
DROP POLICY IF EXISTS "Creatures visible with adventure" ON creatures;
CREATE POLICY "Creatures visible with adventure"
  ON creatures FOR SELECT
  USING (
    adventure_id IN (
      SELECT id FROM adventures 
      WHERE status = 'published' OR creator_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Adventure creator can manage creatures" ON creatures;
CREATE POLICY "Adventure creator can manage creatures"
  ON creatures FOR ALL
  USING (
    adventure_id IN (
      SELECT id FROM adventures WHERE creator_id = (select auth.uid())
    )
  );

-- SESSIONS POLICIES
DROP POLICY IF EXISTS "Sessions visible to participants or public" ON sessions;
CREATE POLICY "Sessions visible to participants or public"
  ON sessions FOR SELECT
  USING (
    is_public = true
    OR seer_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM session_players 
      WHERE session_id = id AND user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Seers can create sessions" ON sessions;
CREATE POLICY "Seers can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    (select auth.uid()) = seer_id
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (select auth.uid()) AND role IN ('seer', 'admin')
    )
  );

DROP POLICY IF EXISTS "Seer can update session" ON sessions;
CREATE POLICY "Seer can update session"
  ON sessions FOR UPDATE
  USING ((select auth.uid()) = seer_id);

DROP POLICY IF EXISTS "Seer can delete session" ON sessions;
CREATE POLICY "Seer can delete session"
  ON sessions FOR DELETE
  USING ((select auth.uid()) = seer_id);

-- SESSION PLAYERS POLICIES
DROP POLICY IF EXISTS "Session participants can view players" ON session_players;
CREATE POLICY "Session participants can view players"
  ON session_players FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR session_id IN (SELECT id FROM sessions WHERE seer_id = (select auth.uid()))
    OR session_id IN (SELECT session_id FROM session_players WHERE user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS "Users can join sessions" ON session_players;
CREATE POLICY "Users can join sessions"
  ON session_players FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own session membership" ON session_players;
CREATE POLICY "Users can update own session membership"
  ON session_players FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Seer can manage session players" ON session_players;
CREATE POLICY "Seer can manage session players"
  ON session_players FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions WHERE seer_id = (select auth.uid()))
  );

-- SESSION EVENTS POLICIES
DROP POLICY IF EXISTS "Session participants can view events" ON session_events;
CREATE POLICY "Session participants can view events"
  ON session_events FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE seer_id = (select auth.uid())
      UNION
      SELECT session_id FROM session_players WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Session participants can create events" ON session_events;
CREATE POLICY "Session participants can create events"
  ON session_events FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE seer_id = (select auth.uid())
      UNION
      SELECT session_id FROM session_players WHERE user_id = (select auth.uid())
    )
  );

-- DICE ROLLS POLICIES
DROP POLICY IF EXISTS "Dice rolls visible to session participants" ON dice_rolls;
CREATE POLICY "Dice rolls visible to session participants"
  ON dice_rolls FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE seer_id = (select auth.uid())
      UNION
      SELECT session_id FROM session_players WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Players can create rolls for own characters" ON dice_rolls;
CREATE POLICY "Players can create rolls for own characters"
  ON dice_rolls FOR INSERT
  WITH CHECK (
    character_id IN (SELECT id FROM characters WHERE user_id = (select auth.uid()))
    OR session_id IN (SELECT id FROM sessions WHERE seer_id = (select auth.uid()))
  );

-- TUTORIAL PROGRESS POLICIES
DROP POLICY IF EXISTS "Users can view own tutorial progress" ON tutorial_progress;
CREATE POLICY "Users can view own tutorial progress"
  ON tutorial_progress FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own tutorial progress" ON tutorial_progress;
CREATE POLICY "Users can manage own tutorial progress"
  ON tutorial_progress FOR ALL
  USING ((select auth.uid()) = user_id);

-- LINKED PROVIDERS POLICIES
DROP POLICY IF EXISTS "Users can view own linked providers" ON linked_providers;
CREATE POLICY "Users can view own linked providers"
  ON linked_providers FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own linked providers" ON linked_providers;
CREATE POLICY "Users can manage own linked providers"
  ON linked_providers FOR ALL
  USING ((select auth.uid()) = user_id);

COMMIT;
