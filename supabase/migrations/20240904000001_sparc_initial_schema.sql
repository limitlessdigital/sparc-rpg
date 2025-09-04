-- SPARC Game Engine Initial Schema Migration
-- Creates core tables for characters, sessions, adventures, and dice rolls

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Character classes enum
CREATE TYPE character_class AS ENUM (
    'cleric',
    'necromancer', 
    'paladin',
    'ranger',
    'rogue',
    'warrior',
    'wizard'
);

-- Session status enum  
CREATE TYPE session_status AS ENUM (
    'waiting',
    'active', 
    'paused',
    'completed'
);

-- Dice roll types enum
CREATE TYPE dice_roll_type AS ENUM (
    'attack',
    'damage',
    'initiative', 
    'skill_check',
    'heroic_save'
);

-- Characters table
CREATE TABLE sparc_characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL CHECK (length(trim(name)) > 0),
    character_class character_class NOT NULL,
    
    -- Stats (1-6 range)
    stat_str INTEGER NOT NULL CHECK (stat_str BETWEEN 1 AND 6),
    stat_dex INTEGER NOT NULL CHECK (stat_dex BETWEEN 1 AND 6),
    stat_int INTEGER NOT NULL CHECK (stat_int BETWEEN 1 AND 6),
    stat_cha INTEGER NOT NULL CHECK (stat_cha BETWEEN 1 AND 6),
    
    -- Health and abilities
    current_hp INTEGER NOT NULL CHECK (current_hp >= 0),
    max_hp INTEGER NOT NULL CHECK (max_hp >= 1),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 10),
    special_ability_available BOOLEAN NOT NULL DEFAULT true,
    heroic_saves_available INTEGER NOT NULL DEFAULT 3 CHECK (heroic_saves_available BETWEEN 0 AND 3),
    
    -- Character details
    equipment JSONB NOT NULL DEFAULT '[]',
    background TEXT NOT NULL DEFAULT '',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_current_hp_not_exceed_max CHECK (current_hp <= max_hp)
);

-- Adventures table
CREATE TABLE sparc_adventures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT NOT NULL DEFAULT '',
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (estimated_duration_minutes BETWEEN 15 AND 180),
    difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    recommended_party_size INTEGER NOT NULL DEFAULT 4 CHECK (recommended_party_size BETWEEN 1 AND 6),
    starting_node_id VARCHAR(100) NOT NULL,
    
    -- Adventure content
    nodes JSONB NOT NULL DEFAULT '{}',
    monsters JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_published BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE sparc_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL CHECK (length(trim(name)) > 0),
    seer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    adventure_id UUID REFERENCES sparc_adventures(id) ON DELETE SET NULL,
    status session_status NOT NULL DEFAULT 'waiting',
    current_node_id VARCHAR(100),
    max_players INTEGER NOT NULL DEFAULT 6 CHECK (max_players BETWEEN 1 AND 6),
    
    -- Session state
    player_characters JSONB NOT NULL DEFAULT '[]', -- Array of character UUIDs
    turn_order JSONB NOT NULL DEFAULT '[]', -- Array of character UUIDs in initiative order
    current_turn_index INTEGER NOT NULL DEFAULT 0,
    session_data JSONB NOT NULL DEFAULT '{}', -- Adventure-specific state
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Dice rolls table for tracking all rolls
CREATE TABLE sparc_dice_rolls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sparc_sessions(id) ON DELETE CASCADE,
    character_id UUID REFERENCES sparc_characters(id) ON DELETE SET NULL, -- NULL for Seer rolls
    roll_type dice_roll_type NOT NULL,
    dice_count INTEGER NOT NULL CHECK (dice_count BETWEEN 1 AND 10),
    results JSONB NOT NULL, -- Array of individual die results
    total INTEGER NOT NULL CHECK (total >= 1),
    difficulty INTEGER, -- Target number for success/failure
    is_success BOOLEAN, -- Calculated success/failure
    modifier INTEGER NOT NULL DEFAULT 0,
    context TEXT NOT NULL DEFAULT '', -- What this roll was for
    rolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session participants junction table
CREATE TABLE sparc_session_participants (
    session_id UUID NOT NULL REFERENCES sparc_sessions(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES sparc_characters(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (session_id, character_id)
);

-- Indexes for performance
CREATE INDEX idx_sparc_characters_user_id ON sparc_characters(user_id);
CREATE INDEX idx_sparc_characters_class ON sparc_characters(character_class);
CREATE INDEX idx_sparc_sessions_seer_id ON sparc_sessions(seer_id);
CREATE INDEX idx_sparc_sessions_status ON sparc_sessions(status);
CREATE INDEX idx_sparc_sessions_adventure_id ON sparc_sessions(adventure_id);
CREATE INDEX idx_sparc_dice_rolls_session_id ON sparc_dice_rolls(session_id);
CREATE INDEX idx_sparc_dice_rolls_character_id ON sparc_dice_rolls(character_id);
CREATE INDEX idx_sparc_dice_rolls_rolled_at ON sparc_dice_rolls(rolled_at DESC);
CREATE INDEX idx_sparc_adventures_published ON sparc_adventures(is_published) WHERE is_published = true;
CREATE INDEX idx_sparc_adventures_created_by ON sparc_adventures(created_by);

-- Row Level Security (RLS) Policies
ALTER TABLE sparc_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparc_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparc_adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparc_dice_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparc_session_participants ENABLE ROW LEVEL SECURITY;

-- Characters: Users can only see their own characters
CREATE POLICY "Users can view their own characters" ON sparc_characters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters" ON sparc_characters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters" ON sparc_characters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters" ON sparc_characters
    FOR DELETE USING (auth.uid() = user_id);

-- Sessions: Participants can view, Seers can manage
CREATE POLICY "Session participants can view sessions" ON sparc_sessions
    FOR SELECT USING (
        auth.uid() = seer_id 
        OR auth.uid() IN (
            SELECT c.user_id 
            FROM sparc_session_participants sp
            JOIN sparc_characters c ON c.id = sp.character_id 
            WHERE sp.session_id = sparc_sessions.id
        )
    );

CREATE POLICY "Seers can create sessions" ON sparc_sessions
    FOR INSERT WITH CHECK (auth.uid() = seer_id);

CREATE POLICY "Seers can update their sessions" ON sparc_sessions
    FOR UPDATE USING (auth.uid() = seer_id);

CREATE POLICY "Seers can delete their sessions" ON sparc_sessions
    FOR DELETE USING (auth.uid() = seer_id);

-- Adventures: Public read for published, creators manage their own
CREATE POLICY "Anyone can view published adventures" ON sparc_adventures
    FOR SELECT USING (is_published = true OR auth.uid() = created_by);

CREATE POLICY "Users can create adventures" ON sparc_adventures
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their adventures" ON sparc_adventures
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their adventures" ON sparc_adventures
    FOR DELETE USING (auth.uid() = created_by);

-- Dice rolls: Session participants can view
CREATE POLICY "Session participants can view dice rolls" ON sparc_dice_rolls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sparc_sessions s 
            WHERE s.id = session_id 
            AND (
                auth.uid() = s.seer_id 
                OR auth.uid() IN (
                    SELECT c.user_id 
                    FROM sparc_session_participants sp
                    JOIN sparc_characters c ON c.id = sp.character_id 
                    WHERE sp.session_id = s.id
                )
            )
        )
    );

CREATE POLICY "Session participants can create dice rolls" ON sparc_dice_rolls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sparc_sessions s 
            WHERE s.id = session_id 
            AND (
                auth.uid() = s.seer_id 
                OR (
                    character_id IS NOT NULL 
                    AND auth.uid() IN (
                        SELECT c.user_id 
                        FROM sparc_characters c 
                        WHERE c.id = character_id
                    )
                )
            )
        )
    );

-- Session participants: Manage participation
CREATE POLICY "Session participants can view participation" ON sparc_session_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sparc_sessions s 
            WHERE s.id = session_id 
            AND (
                auth.uid() = s.seer_id 
                OR auth.uid() IN (
                    SELECT c.user_id 
                    FROM sparc_characters c 
                    WHERE c.id = character_id
                )
            )
        )
    );

CREATE POLICY "Character owners can join sessions" ON sparc_session_participants
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT c.user_id 
            FROM sparc_characters c 
            WHERE c.id = character_id
        )
    );

CREATE POLICY "Seers can manage session participation" ON sparc_session_participants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM sparc_sessions s 
            WHERE s.id = session_id 
            AND auth.uid() = s.seer_id
        )
    );

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sparc_characters_updated_at 
    BEFORE UPDATE ON sparc_characters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sparc_sessions_updated_at 
    BEFORE UPDATE ON sparc_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sparc_adventures_updated_at 
    BEFORE UPDATE ON sparc_adventures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();