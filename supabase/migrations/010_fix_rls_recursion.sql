-- Migration: 010_fix_rls_recursion
-- Description: Fix circular RLS recursion between sessions and session_players
-- The issue: sessions policy references session_players, which references sessions
-- Solution: Use SECURITY DEFINER functions to break the cycle
-- Created: 2026-01-29

BEGIN;

-- Create a security definer function to safely check session participation
-- SECURITY DEFINER bypasses RLS, breaking the circular reference
CREATE OR REPLACE FUNCTION public.user_is_session_participant(session_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.session_players 
    WHERE session_id = session_id_param AND user_id = user_id_param
  );
$$;

-- Create function to check if user is seer of a session
CREATE OR REPLACE FUNCTION public.user_is_seer(session_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE id = session_id_param AND seer_id = user_id_param
  );
$$;

-- Fix sessions policy - use security definer function instead of subquery
DROP POLICY IF EXISTS "Sessions visible to participants or public" ON sessions;
CREATE POLICY "Sessions visible to participants or public"
  ON sessions FOR SELECT
  USING (
    is_public = true
    OR seer_id = (select auth.uid())
    OR public.user_is_session_participant(id, (select auth.uid()))
  );

-- Fix session_players policies - use security definer function
DROP POLICY IF EXISTS "Session participants can view players" ON session_players;
CREATE POLICY "Session participants can view players"
  ON session_players FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR public.user_is_seer(session_id, (select auth.uid()))
  );

DROP POLICY IF EXISTS "Seer can manage session players" ON session_players;
CREATE POLICY "Seer can manage session players"
  ON session_players FOR ALL
  USING (
    public.user_is_seer(session_id, (select auth.uid()))
  );

COMMIT;
