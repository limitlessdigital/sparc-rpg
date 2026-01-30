-- Migration: 001_extensions_and_enums
-- Description: Enable required extensions and create enum types
-- Created: 2026-01-29

BEGIN;

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUM TYPES
-- ============================================

-- Character class enum (SPARC RPG classes)
CREATE TYPE character_class AS ENUM (
  'warrior',
  'rogue', 
  'wizard',
  'cleric',
  'paladin',
  'ranger',
  'necromancer'
);

-- Core attribute enum
CREATE TYPE attribute AS ENUM ('might', 'grace', 'wit', 'heart');

-- Adventure difficulty levels
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Adventure publishing status
CREATE TYPE adventure_status AS ENUM ('draft', 'published', 'archived');

-- Game session status
CREATE TYPE session_status AS ENUM (
  'waiting',        -- Created, waiting for players
  'starting_soon',  -- About to start
  'active',         -- Game in progress
  'paused',         -- Temporarily paused
  'completed',      -- Finished successfully
  'cancelled'       -- Cancelled by Seer
);

-- Dice roll outcome types
CREATE TYPE roll_outcome AS ENUM (
  'critical_success',
  'success',
  'failure',
  'critical_failure'
);

-- Dice roll types
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

-- Tutorial path choices
CREATE TYPE tutorial_path AS ENUM ('player', 'seer');

-- User roles for authorization
CREATE TYPE user_role AS ENUM ('player', 'seer', 'admin');

COMMIT;
