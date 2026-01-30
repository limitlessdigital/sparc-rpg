-- SPARC Character Database Schema
-- Supports the 5-minute character creation wizard with all SPARC features

-- Characters table - stores all created characters
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name VARCHAR(50) NOT NULL,
    character_class VARCHAR(20) NOT NULL CHECK (character_class IN (
        'warrior', 'paladin', 'wizard', 'cleric', 'rogue', 'ranger', 'necromancer'
    )),
    
    -- Core stats (1-6 range per SPARC rules)
    str_stat INTEGER NOT NULL CHECK (str_stat >= 1 AND str_stat <= 6),
    dex_stat INTEGER NOT NULL CHECK (dex_stat >= 1 AND dex_stat <= 6), 
    int_stat INTEGER NOT NULL CHECK (int_stat >= 1 AND int_stat <= 6),
    cha_stat INTEGER NOT NULL CHECK (cha_stat >= 1 AND cha_stat <= 6),
    primary_stat VARCHAR(3) NOT NULL CHECK (primary_stat IN ('str', 'dex', 'int', 'cha')),
    
    -- HP and level
    current_hp INTEGER NOT NULL CHECK (current_hp >= 0),
    max_hp INTEGER NOT NULL CHECK (max_hp > 0),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    
    -- Abilities (per adventure/rest)
    special_ability_available BOOLEAN NOT NULL DEFAULT TRUE,
    heroic_saves_available INTEGER NOT NULL DEFAULT 3 CHECK (heroic_saves_available >= 0 AND heroic_saves_available <= 3),
    
    -- Character background and equipment (stored as JSON for flexibility)
    background TEXT NOT NULL,
    equipment JSONB NOT NULL DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT characters_hp_valid CHECK (current_hp <= max_hp)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_class ON characters(character_class);
CREATE INDEX IF NOT EXISTS idx_characters_created_at ON characters(created_at);

-- RLS (Row Level Security) policies for multi-tenant safety
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own characters
CREATE POLICY characters_user_isolation ON characters
    FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_characters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS characters_updated_at_trigger ON characters;
CREATE TRIGGER characters_updated_at_trigger
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_characters_updated_at();

-- Character templates reference table (for consistency checks)
CREATE TABLE IF NOT EXISTS character_templates (
    character_class VARCHAR(20) PRIMARY KEY,
    base_str INTEGER NOT NULL,
    base_dex INTEGER NOT NULL, 
    base_int INTEGER NOT NULL,
    base_cha INTEGER NOT NULL,
    starting_hp INTEGER NOT NULL,
    equipment JSONB NOT NULL,
    background_options JSONB NOT NULL,
    special_ability_name VARCHAR(100) NOT NULL,
    special_ability_description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert template data for all SPARC classes
INSERT INTO character_templates (
    character_class, base_str, base_dex, base_int, base_cha, starting_hp,
    equipment, background_options, special_ability_name, special_ability_description
) VALUES 
    ('warrior', 6, 4, 2, 3, 18,
     '["Battle Axe", "Chain Mail", "Shield", "Javelin", "Adventurer''s Pack"]',
     '["Soldier from the local garrison", "Mercenary seeking steady employment", "Blacksmith''s apprentice with martial training", "Village defender who took up arms"]',
     'Battle Fury',
     'Make an additional attack this turn with +1 damage'),
     
    ('paladin', 5, 2, 3, 4, 16,
     '["Holy Sword", "Plate Armor", "Shield", "Holy Symbol", "Rope (50ft)"]',
     '["Knight sworn to protect the innocent", "Reformed criminal seeking redemption", "Noble''s child dedicated to justice", "Temple guard called to greater service"]',
     'Righteous Strike', 
     'Next attack deals double damage if target is evil or undead'),
     
    ('wizard', 2, 3, 6, 4, 8,
     '["Spellbook", "Wizard Robes", "Staff", "Component Pouch", "Scroll Case"]',
     '["Academy student eager for real adventure", "Self-taught mage with natural talent", "Librarian who discovered ancient knowledge", "Apprentice whose master mysteriously vanished"]',
     'Arcane Blast',
     'Deal 2d6 damage to target within line of sight, ignores armor'),
     
    ('cleric', 3, 2, 4, 5, 14,
     '["Holy Symbol", "Chain Mail", "Shield", "Mace", "Healing Potion"]', 
     '["Temple Acolyte who joined to help others", "Former healer who found divine calling", "Village priest seeking to protect people", "Monastery-trained scholar with healing gifts"]',
     'Divine Healing',
     'Restore 1d6+2 HP to any character within speaking distance'),
     
    ('rogue', 3, 6, 4, 3, 10,
     '["Daggers (2)", "Leather Armor", "Thieves'' Tools", "Rope (50ft)", "Lock Picks"]',
     '["Former street thief seeking honest work", "Guild spy working undercover", "Acrobat from a traveling circus", "Scout who learned stealth from necessity"]',
     'Sneak Attack',
     'Deal +2d6 damage when attacking an unaware enemy'),
     
    ('ranger', 4, 5, 3, 2, 12,
     '["Longbow", "Arrows (30)", "Leather Armor", "Short Sword", "Survival Kit"]',
     '["Forest guide who knows the wild paths", "Hunter who protects villages from beasts", "Scout from a frontier settlement", "Wanderer who learned to live off the land"]',
     'Perfect Shot',
     'Next ranged attack automatically hits and deals maximum damage'),
     
    ('necromancer', 2, 3, 6, 3, 10,
     '["Grimoire", "Black Robes", "Component Pouch", "Dagger", "Bone Wand"]',
     '["Academic who studied forbidden knowledge", "Grieving person who sought to speak with the dead", "Former healer who embraced darker arts", "Outcast scholar shunned by traditional mages"]',
     'Drain Life',
     'Deal 1d6 damage and heal yourself for the same amount')
ON CONFLICT (character_class) DO NOTHING;

-- Performance monitoring for character creation speed
CREATE TABLE IF NOT EXISTS character_creation_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    character_id UUID REFERENCES characters(id),
    creation_duration_ms INTEGER NOT NULL,
    wizard_step_timings JSONB, -- Track time spent on each step
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT creation_under_5_minutes CHECK (creation_duration_ms <= 300000) -- 5 minutes max
);

-- Index for performance metrics
CREATE INDEX IF NOT EXISTS idx_creation_metrics_duration ON character_creation_metrics(creation_duration_ms);
CREATE INDEX IF NOT EXISTS idx_creation_metrics_created_at ON character_creation_metrics(created_at);

-- View for character creation performance stats
CREATE OR REPLACE VIEW character_creation_performance AS
SELECT 
    COUNT(*) as total_characters_created,
    AVG(creation_duration_ms) as avg_creation_time_ms,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY creation_duration_ms) as median_creation_time_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY creation_duration_ms) as p95_creation_time_ms,
    COUNT(*) FILTER (WHERE creation_duration_ms <= 300000) * 100.0 / COUNT(*) as under_5_minutes_rate,
    MAX(created_at) as last_character_created
FROM character_creation_metrics
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Comments for documentation
COMMENT ON TABLE characters IS 'SPARC RPG characters created via 5-minute wizard';
COMMENT ON TABLE character_templates IS 'Reference data for SPARC character classes';
COMMENT ON TABLE character_creation_metrics IS 'Performance tracking for 5-minute character creation requirement';
COMMENT ON VIEW character_creation_performance IS 'Performance metrics for character creation speed';

-- Grant permissions (adjust based on your auth setup)
-- GRANT ALL ON characters TO sparc_app;
-- GRANT ALL ON character_templates TO sparc_app;
-- GRANT ALL ON character_creation_metrics TO sparc_app;