-- Rollback Migration
-- ⚠️ DESTRUCTIVE: This drops all tables and types
-- Run in reverse order of creation

BEGIN;

-- Drop triggers first
DROP TRIGGER IF EXISTS cleanup_events_trigger ON session_events;
DROP TRIGGER IF EXISTS enforce_session_capacity ON session_players;
DROP TRIGGER IF EXISTS set_session_code ON sessions;
DROP TRIGGER IF EXISTS update_tutorial_progress_updated_at ON tutorial_progress;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
DROP TRIGGER IF EXISTS update_creatures_updated_at ON creatures;
DROP TRIGGER IF EXISTS update_adventures_updated_at ON adventures;
DROP TRIGGER IF EXISTS update_characters_updated_at ON characters;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS enforce_character_limit ON characters;
DROP TRIGGER IF EXISTS on_user_created_assign_role ON users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_session_complete ON sessions;

-- Drop functions
DROP FUNCTION IF EXISTS cleanup_old_events();
DROP FUNCTION IF EXISTS check_session_capacity();
DROP FUNCTION IF EXISTS generate_session_code();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS check_character_limit();
DROP FUNCTION IF EXISTS assign_default_role();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS get_session_details(UUID);
DROP FUNCTION IF EXISTS update_user_stats();
DROP FUNCTION IF EXISTS user_has_role(UUID, user_role);
DROP FUNCTION IF EXISTS get_user_roles(UUID);
DROP FUNCTION IF EXISTS find_session_by_code(TEXT);
DROP FUNCTION IF EXISTS get_browse_sessions(difficulty_level, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS calculate_roll_outcome(INTEGER, INTEGER, INTEGER[]);

-- Drop tables (in dependency order)
DROP TABLE IF EXISTS linked_providers CASCADE;
DROP TABLE IF EXISTS tutorial_progress CASCADE;
DROP TABLE IF EXISTS dice_rolls CASCADE;
DROP TABLE IF EXISTS session_events CASCADE;
DROP TABLE IF EXISTS session_players CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS creatures CASCADE;
DROP TABLE IF EXISTS adventures CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS tutorial_path;
DROP TYPE IF EXISTS roll_type;
DROP TYPE IF EXISTS roll_outcome;
DROP TYPE IF EXISTS session_status;
DROP TYPE IF EXISTS adventure_status;
DROP TYPE IF EXISTS difficulty_level;
DROP TYPE IF EXISTS attribute;
DROP TYPE IF EXISTS character_class;

COMMIT;
