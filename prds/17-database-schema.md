# PRD 17: Database Schema Design

> **Status**: Ready for Implementation  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 3 days  
> **Dependencies**: None (foundational)

---

## Overview

This PRD defines the complete PostgreSQL database schema for SPARC RPG, hosted on Supabase. The schema supports all game mechanics, user management, real-time features, and Row Level Security (RLS) for data protection.

### Goals
- Support all SPARC RPG game mechanics
- Enable real-time updates via Supabase Realtime
- Secure data access with Row Level Security
- Optimize for read-heavy game session workloads
- Maintain data integrity with constraints and triggers

### Non-Goals
- Sharding or horizontal scaling (single database sufficient)
- Full-text search beyond basic LIKE queries
- Time-series analytics (use separate analytics DB)
- Multi-tenancy (single tenant design)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SPARC RPG DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
  │   users     │        │ adventures  │        │  creatures  │
  │─────────────│        │─────────────│        │─────────────│
  │ id (PK)     │◄───┐   │ id (PK)     │        │ id (PK)     │
  │ email       │    │   │ creator_id  │───────►│ adventure_id│
  │ display_name│    │   │ name        │        │ name        │
  │ avatar_url  │    │   │ description │        │ stats       │
  │ created_at  │    │   │ content     │        │ abilities   │
  └─────────────┘    │   │ is_published│        └─────────────┘
        │            │   │ difficulty  │
        │            │   └─────────────┘
        │            │          │
        │            │          │
        ▼            │          ▼
  ┌─────────────┐    │   ┌─────────────┐        ┌─────────────┐
  │ characters  │    │   │  sessions   │        │ dice_rolls  │
  │─────────────│    │   │─────────────│        │─────────────│
  │ id (PK)     │    │   │ id (PK)     │◄───────│ session_id  │
  │ user_id     │────┤   │ seer_id     │───────►│ character_id│
  │ name        │    │   │ adventure_id│        │ results     │
  │ class       │    │   │ status      │        │ outcome     │
  │ attributes  │    │   │ code        │        │ created_at  │
  │ hit_points  │    └───│ is_public   │        └─────────────┘
  │ equipment   │        │ created_at  │
  └─────────────┘        └─────────────┘
        │                      │
        │                      │
        ▼                      ▼
  ┌─────────────────────────────────┐        ┌─────────────┐
  │       session_players           │        │session_events│
  │─────────────────────────────────│        │─────────────│
  │ session_id (PK)                 │        │ id (PK)     │
  │ user_id (PK)                    │        │ session_id  │
  │ character_id                    │        │ event_type  │
  │ joined_at                       │        │ payload     │
  │ is_active                       │        │ created_at  │
  └─────────────────────────────────┘        └─────────────┘
```

---

## Core Tables

### users (Supabase Auth Extended)

Supabase manages the base `auth.users` table. We extend with a public profile:

```sql
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

-- Indexes
CREATE INDEX idx_users_display_name ON users(display_name);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Auto-create profile on signup
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### characters

```sql
CREATE TYPE character_class AS ENUM (
  'warrior', 'rogue', 'wizard', 'cleric', 'paladin', 'ranger', 'necromancer'
);

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
  
  -- Equipment and abilities
  equipment JSONB NOT NULL DEFAULT '[]',
  special_ability JSONB NOT NULL,
  
  -- Metadata
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_character_name UNIQUE (user_id, name),
  CONSTRAINT valid_name CHECK (char_length(name) BETWEEN 2 AND 50)
);

-- Indexes
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_class ON characters(class);
CREATE INDEX idx_characters_last_played ON characters(last_played_at DESC NULLS LAST);

-- Limit characters per user
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
```

### adventures

```sql
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE adventure_status AS ENUM ('draft', 'published', 'archived');

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
  
  -- Content (Adventure Forge data)
  content JSONB NOT NULL DEFAULT '{}',
  
  -- Publishing
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
  
  CONSTRAINT valid_player_range CHECK (min_players <= max_players),
  CONSTRAINT valid_name CHECK (char_length(name) BETWEEN 3 AND 100)
);

-- Indexes
CREATE INDEX idx_adventures_creator_id ON adventures(creator_id);
CREATE INDEX idx_adventures_status ON adventures(status);
CREATE INDEX idx_adventures_published ON adventures(published_at DESC) 
  WHERE status = 'published';
CREATE INDEX idx_adventures_difficulty ON adventures(difficulty) 
  WHERE status = 'published';
CREATE INDEX idx_adventures_content ON adventures USING gin(content);
```

### sessions

```sql
CREATE TYPE session_status AS ENUM (
  'waiting',        -- Created, waiting for players
  'starting_soon',  -- About to start
  'active',         -- Game in progress
  'paused',         -- Temporarily paused
  'completed',      -- Finished successfully
  'cancelled'       -- Cancelled by Seer
);

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

-- Indexes
CREATE INDEX idx_sessions_seer_id ON sessions(seer_id);
CREATE INDEX idx_sessions_adventure_id ON sessions(adventure_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_sessions_public_waiting ON sessions(is_public, status, scheduled_start)
  WHERE is_public = true AND status IN ('waiting', 'starting_soon');

-- Generate unique session code
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code CHAR(6);
  code_exists BOOLEAN;
BEGIN
  LOOP
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
```

### session_players

```sql
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

-- Indexes
CREATE INDEX idx_session_players_character ON session_players(character_id);
CREATE INDEX idx_session_players_active ON session_players(session_id) 
  WHERE is_active = true;

-- Enforce max players
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
```

### dice_rolls

```sql
CREATE TYPE roll_outcome AS ENUM (
  'critical_success',
  'success',
  'failure',
  'critical_failure'
);

CREATE TYPE roll_type AS ENUM (
  'attribute_check',
  'attack',
  'defense',
  'initiative',
  'damage',
  'healing',
  'ability',
  'heroic_save'
);

CREATE TYPE attribute AS ENUM ('might', 'grace', 'wit', 'heart');

CREATE TABLE dice_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id),
  character_name TEXT NOT NULL,
  
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
  margin INTEGER NOT NULL,
  
  -- Display
  description TEXT,
  animation_seed BIGINT,
  
  -- Heroic save tracking
  original_roll_id UUID REFERENCES dice_rolls(id),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure results match dice_count
  CONSTRAINT valid_results CHECK (array_length(results, 1) = dice_count)
);

-- Indexes
CREATE INDEX idx_dice_rolls_session ON dice_rolls(session_id);
CREATE INDEX idx_dice_rolls_character ON dice_rolls(character_id);
CREATE INDEX idx_dice_rolls_created ON dice_rolls(created_at DESC);
CREATE INDEX idx_dice_rolls_type ON dice_rolls(session_id, roll_type);
```

### session_events

Real-time events for Supabase Realtime:

```sql
CREATE TABLE session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
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
```

### tutorial_progress

```sql
CREATE TYPE tutorial_path AS ENUM ('player', 'seer');

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
```

---

## Row Level Security (RLS)

### users

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone can read basic profile info
CREATE POLICY "Public profiles readable"
ON users FOR SELECT
USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);
```

### characters

```sql
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

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
```

### adventures

```sql
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;

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
```

### sessions

```sql
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

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

-- Only Seers can create sessions
CREATE POLICY "Users can create sessions"
ON sessions FOR INSERT
WITH CHECK (auth.uid() = seer_id);

-- Only Seer can update session
CREATE POLICY "Seer can update session"
ON sessions FOR UPDATE
USING (auth.uid() = seer_id);
```

### dice_rolls

```sql
ALTER TABLE dice_rolls ENABLE ROW LEVEL SECURITY;

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
```

---

## Stored Procedures

### get_session_details

```sql
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
          'isActive', sp.is_active
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
```

### update_user_stats

```sql
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_session_complete
  AFTER UPDATE ON sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_user_stats();
```

---

## Migrations

### Initial Migration (001)

```sql
-- 001_initial_schema.sql
BEGIN;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE character_class AS ENUM (...);
CREATE TYPE difficulty_level AS ENUM (...);
-- ... other enums

-- Create tables
CREATE TABLE users (...);
CREATE TABLE characters (...);
CREATE TABLE adventures (...);
CREATE TABLE sessions (...);
CREATE TABLE session_players (...);
CREATE TABLE dice_rolls (...);
CREATE TABLE session_events (...);
CREATE TABLE tutorial_progress (...);

-- Create indexes
-- ... all indexes

-- Enable RLS
-- ... all RLS policies

-- Create triggers
-- ... all triggers

-- Create functions
-- ... all functions

COMMIT;
```

### Rollback

```sql
-- 001_initial_schema_rollback.sql
BEGIN;

DROP TABLE IF EXISTS session_events CASCADE;
DROP TABLE IF EXISTS dice_rolls CASCADE;
DROP TABLE IF EXISTS session_players CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS adventures CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS tutorial_progress CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS character_class;
DROP TYPE IF EXISTS difficulty_level;
-- ... other enums

COMMIT;
```

---

## Performance Optimization

### Query Examples

```sql
-- Browse public sessions (optimized)
EXPLAIN ANALYZE
SELECT s.id, s.code, s.status, a.name, a.thumbnail_url,
       COUNT(sp.user_id) as player_count, s.max_players
FROM sessions s
JOIN adventures a ON s.adventure_id = a.id
LEFT JOIN session_players sp ON s.id = sp.session_id AND sp.is_active = true
WHERE s.is_public = true 
  AND s.status IN ('waiting', 'starting_soon')
GROUP BY s.id, a.id
HAVING COUNT(sp.user_id) < s.max_players
ORDER BY s.scheduled_start NULLS LAST, s.created_at DESC
LIMIT 20;

-- Expected: Index Scan using idx_sessions_public_waiting
```

### Maintenance

```sql
-- Vacuum and analyze schedule (via pg_cron)
SELECT cron.schedule('vacuum-analyze', '0 3 * * *', 
  'VACUUM ANALYZE sessions; VACUUM ANALYZE dice_rolls;');

-- Archive old completed sessions (monthly)
SELECT cron.schedule('archive-sessions', '0 0 1 * *', $$
  INSERT INTO archived_sessions
  SELECT * FROM sessions 
  WHERE status = 'completed' 
    AND ended_at < NOW() - INTERVAL '90 days';
  
  DELETE FROM sessions 
  WHERE status = 'completed' 
    AND ended_at < NOW() - INTERVAL '90 days';
$$);
```

---

## Implementation Checklist

### Schema Creation
- [ ] Create all enum types
- [ ] Create users table with trigger
- [ ] Create characters table with constraints
- [ ] Create adventures table
- [ ] Create sessions table with code generator
- [ ] Create session_players table
- [ ] Create dice_rolls table
- [ ] Create session_events table
- [ ] Create tutorial_progress table

### Security
- [ ] Enable RLS on all tables
- [ ] Create all RLS policies
- [ ] Test policies with different user roles
- [ ] Audit security with penetration testing

### Performance
- [ ] Create all indexes
- [ ] Run EXPLAIN ANALYZE on critical queries
- [ ] Set up vacuum schedule
- [ ] Configure connection pooling

### Migration
- [ ] Create initial migration file
- [ ] Create rollback migration
- [ ] Test migration in staging
- [ ] Document migration procedure
